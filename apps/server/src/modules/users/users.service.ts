import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import _ from 'lodash';
import { EmailState, makeHasState, SearchMatch } from 'src/common/enum';
import { AppError } from 'src/common/errors';
import { ChangeUserRolesDto, SearchUsersDto } from './dtos';
import { RedisService } from 'src/core/redis/redis.service';
import { messages } from 'src/constants/messages';
import { userDetailSelect, userSelect } from './constants';
import { generateSkip } from 'src/utils/generate-skip.util';
import { SECURITY_STAMPS_REDIS_KEY } from 'src/constants/auth';
import { Random } from 'src/utils/random.util';
import { Role, RoleDocument } from '../roles/roles.schema';
import { User, UserDocument } from './users.schema';
import { UserLogins, UserLoginsDocument } from './user-logins.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(UserLogins.name)
    private userLoginsModel: Model<UserLoginsDocument>,
    private redisService: RedisService,
  ) {}

  async findAll(dto: SearchUsersDto) {
    const query = this.userModel.find();
    const andConditions: any[] = [];

    if (!_.isNil(dto.username)) {
      andConditions.push({ username: new RegExp(dto.username, 'i') });
    }

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

  async findByUnique(idOrUsername: Partial<{ id: string; username: string }>) {
    return this.userModel.findOne(idOrUsername).select(userSelect).exec();
  }

  async findByUniqueWithDetail(
    idOrUsername: Partial<{ id: string; username: string }>,
  ) {
    return this.userModel.findOne(idOrUsername).select(userDetailSelect).exec();
  }

  async changeRoles(dto: ChangeUserRolesDto) {
    const user = await this.userModel
      .findById(dto.id)
      .select('id securityStamp userRoles')
      .populate('userRoles')
      .exec();

    if (!user) {
      throw new AppError.NotFound(messages.error.notFoundEntity).setParams({
        entity: 'User',
        id: dto.id,
      });
    }

    const roleCount = await this.roleModel.countDocuments({
      _id: { $in: dto.roleIds },
    });

    if (roleCount !== dto.roleIds.length) {
      throw new AppError.Argument(messages.error.changeUserRoles);
    }

    const session = await this.userModel.startSession();
    session.startTransaction();
    try {
      await this.roleModel
        .deleteMany({
          userId: user._id,
          roleId: { $nin: dto.roleIds },
        })
        .session(session);

      const newRoles = _(dto.roleIds)
        .difference(user.userRoles.map((role) => role._id.toString()))
        .map((roleId) => ({
          userId: user._id,
          roleId: new Types.ObjectId(roleId),
        }))
        .value();

      if (newRoles.length) {
        await this.roleModel.insertMany(newRoles, { session });
      }

      await this.redisService.db.zRem(
        SECURITY_STAMPS_REDIS_KEY,
        user.securityStamp,
      );

      user.securityStamp = Random.generateSecurityStamp();
      await user.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
