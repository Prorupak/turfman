import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import _ from 'lodash';
import { EmailState, makeHasState, SearchMatch } from 'common/enum';
import { AppError } from 'common/errors';
import { ChangeUserRolesDto, SearchUsersDto } from './dtos';
import { RedisService } from 'core/redis/redis.service';
import { messages } from 'constants/messages';
import { userDetailSelect, userSelect } from './constants';
import { generateSkip } from 'utils/generate-skip.util';
import { SECURITY_STAMPS_REDIS_KEY } from 'constants/auth';
import { Random } from 'utils/random.util';
import { Role, RoleDocument } from '../roles/schemas/roles.schema';
import { User, UserDocument } from './schemas/users.schema';
import { UserLogins, UserLoginsDocument } from './schemas/user-logins.schema';
import {
  UserRole,
  UserRoleDocument,
} from 'modules/roles/schemas/user-role.schema';
import { runInTransaction } from 'utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRoleDocument>,
    @InjectModel(UserLogins.name)
    private userLoginsModel: Model<UserLoginsDocument>,
    @InjectConnection() private readonly connection: Connection,
    private redisService: RedisService,
  ) {}

  async findAll(dto: SearchUsersDto) {
    const query = this.userModel.find();
    const andConditions: any[] = [];

    if (!_.isNil(dto.name)) {
      andConditions.push({
        $or: [
          { firstName: new RegExp(dto.name, 'i') },
          { lastName: new RegExp(dto.name, 'i') },
        ],
      });
    }

    if (!_.isNil(dto.roleIds)) {
      if (dto.roleMode === SearchMatch.All) {
        dto.roleIds.forEach((roleId) => {
          andConditions.push({ userRoles: { $elemMatch: { roleId } } });
        });
      } else {
        andConditions.push({
          userRoles: { $elemMatch: { roleId: { $in: dto.roleIds } } },
        });
      }
    }

    if (!_.isNil(dto.emailStates)) {
      const orConditions: any[] = [];
      const hasState = makeHasState(dto.emailStates);

      if (hasState(EmailState.None)) {
        orConditions.push({ email: null });
      }
      if (hasState(EmailState.Verified)) {
        orConditions.push({ email: { $ne: null }, emailConfirmed: true });
      }
      if (hasState(EmailState.Unverified)) {
        orConditions.push({ email: { $ne: null }, emailConfirmed: false });
      }

      if (orConditions.length > 0) {
        andConditions.push({ $or: orConditions });
      } else {
        andConditions.push({ _id: null });
      }
    }

    if (!_.isNil(dto.email)) {
      andConditions.push({ email: new RegExp(dto.email, 'i') });
    }

    if (andConditions.length > 0) {
      query.and(andConditions);
    }

    const [totalCount, records] = await Promise.all([
      this.userModel.countDocuments(query.getFilter()),
      query
        .select(userSelect)
        .sort({ [dto.sort.field]: dto.sort.order })
        .skip(generateSkip(dto.skip ?? 1, dto.take ?? 10))
        .limit(dto.take ?? 10)
        .exec(),
    ]);

    return { records, count: records.length, totalCount };
  }

  async findByUnique(idOrEmail: Partial<{ id: string; email: string }>) {
    return this.userModel
      .findOne({
        $or: [{ _id: idOrEmail.id }, { email: idOrEmail.email }],
      })
      .select(userSelect)
      .exec();
  }

  async findByUniqueWithDetail(
    idOrEmail: Partial<{
      id: string;
      email: string;
    }>,
  ): Promise<
    Omit<User, 'userRoles'> & {
      [key: string]: any | any[];
    }
  > {
    const user = await this.userModel
      .findOne({
        $or: [{ _id: idOrEmail.id }, { email: idOrEmail.email }],
      })
      .select(userDetailSelect)
      .populate({ path: 'userRoles', select: 'roles roleId userId' })
      .lean()
      .exec();

    console.log(JSON.stringify({ user }));

    const roles = (user?.userRoles as unknown as UserRole[])?.map(
      (role) => role.roles,
    );

    console.log({ roles });

    return {
      ...user,
      userRoles: roles,
    };
  }

  async changeRoles(dto: ChangeUserRolesDto) {
    return runInTransaction(this.connection, async (session) => {
      const user = await this.userModel
        .findById(dto.id)
        .select('id securityStamp userRoles')
        .populate('userRoles')
        .session(session)
        .lean()
        .exec();

      if (!user) {
        throw new AppError.NotFound(messages.error.notFoundEntity).setParams({
          entity: 'User',
          id: dto.id,
        });
      }

      // Convert roleIds to ObjectId[]
      const roleIds = dto.roleIds.map((id) => new Types.ObjectId(id));

      // Check if all roles exist
      const roleCount = await this.roleModel
        .countDocuments({ _id: { $in: roleIds } })
        .session(session);

      if (roleCount !== roleIds.length) {
        throw new AppError.Argument(messages.error.changeUserRoles);
      }

      const currentRoleIds = user.userRoles.map((role: any) =>
        role._id.toString(),
      );
      const rolesToAdd = roleIds.filter(
        (roleId) => !currentRoleIds.includes(roleId.toString()),
      );

      const bulkOps = [
        // Remove roles not in dto.roleIds
        {
          deleteMany: {
            filter: { userId: user._id, roleId: { $nin: roleIds } },
          },
        },
        // Add new roles using insertOne for each role
        ...rolesToAdd.map((roleId) => ({
          insertOne: {
            document: {
              userId: user._id,
              roleId,
            },
          },
        })),
      ];

      if (bulkOps.length > 0) {
        await this.userRoleModel.bulkWrite(bulkOps, { session });
      }

      // Update the role names in userRole collection
      const roleNames = await this.roleModel
        .find({ _id: { $in: roleIds } })
        .select('name')
        .lean();

      await this.userRoleModel.updateMany(
        { userId: user._id, roleId: { $in: roleIds } },
        { $set: { roles: roleNames.map((role) => role.name) } },
        { session },
      );

      // Update security stamp and Redis
      await this.redisService.db.zRem(
        SECURITY_STAMPS_REDIS_KEY,
        user.securityStamp,
      );

      user.securityStamp = Random.generateSecurityStamp();
      await this.userModel.updateOne(
        { _id: user._id },
        { $set: { securityStamp: user.securityStamp } },
        { session },
      );
    });
  }

  async findByProvider(provider: string, sub: string) {
    const userLogin = await this.userLoginsModel
      .findOne({ providerName: provider, providerKey: sub })
      .populate({
        path: 'userId',
        select: userDetailSelect,
      })
      .exec();

    return userLogin ? userLogin.userId : null;
  }

  async findByRefreshToken(token: string) {
    return this.userModel
      .findOne({ 'refreshTokens.token': token })
      .select(userDetailSelect)
      .exec();
  }
}
