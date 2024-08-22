import { Inject, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { Config } from 'config/config.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../users/schemas/refresh-token.schema';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { AppError } from 'common/errors';
import { messages } from 'constants/messages';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import { User, UserDocument } from '../users/schemas/users.schema';
import {
  ConfirmEmailDto,
  ForgotPasswordDto,
  RegisterDto,
  ResetPasswordDto,
  SearchImageDto,
  UpdateEmailDto,
  UpdateImageDto,
  UpdatePasswordDto,
} from './dtos';
import { RedisService } from 'core/redis/redis.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';
import { CloudStorageService } from '../../core/cloud-storage/cloud-storage.service';
import { AuthFile } from 'constants/';
import { AuthUser } from './auth-user.class';
import { IFile } from 'helpers/file-type.helper';
import { compare, genSalt, hash } from 'bcryptjs';
import { Random } from 'utils/random.util';
import { SECURITY_STAMPS_REDIS_KEY } from 'constants/auth';
import { VerificationTokensService } from 'modules/verification-tokens/verification-tokens.service';
import { MailService } from 'core/mail/mail.service';
import { VerificationTokenType } from 'modules/verification-tokens/schemas/verification-tokens.enums';
import { Role, RoleDocument } from 'modules/roles/schemas/roles.schema';
import { createCustomTokenGenerator, runInTransaction } from 'utils';
import {
  UserRole,
  UserRoleDocument,
} from 'modules/roles/schemas/user-role.schema';
import { userDetailSelect } from 'modules/users/constants';

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
    @InjectModel(UserRole.name)
    private userRoleModel: Model<UserRoleDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectConnection() private readonly connection: Connection,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService<Config>,
    private redisService: RedisService,
    private cloudStorageService: CloudStorageService,
    private verificationTokensService: VerificationTokensService,
    private mailService: MailService,
  ) {}

  /**
   * Verifies if a given security stamp is valid by checking in Redis cache
   * and falling back to a database query if not found in Redis.
   *
   * @param {string} securityStamp - The security stamp to verify.
   * @returns {Promise<boolean>} - Returns `true` if the security stamp is valid; otherwise, `false`.
   */
  async verifySecurityStamp(securityStamp: string): Promise<boolean> {
    const score = await this.redisService.db.zScore(
      SECURITY_STAMPS_REDIS_KEY,
      JSON.stringify(securityStamp),
    );

    if (score !== null) {
      return true;
    }

    const count = await this.userModel.countDocuments({ securityStamp }).exec();

    if (count > 0) {
      // Cache the security stamp in Redis for 15 minutes if found in the database
      await this.redisService.db.zAdd(SECURITY_STAMPS_REDIS_KEY, {
        value: JSON.stringify(securityStamp),
        score: dayjs().add(15, 'minutes').unix(),
      });
    }

    // Return true if exactly one user is found with the security stamp
    return count === 1;
  }

  async updateSecurityStamp(
    userOrUserId: string | { id: string; securityStamp: string },
  ) {
    const { securityStamp } =
      typeof userOrUserId === 'string'
        ? await this.userModel
            .findById(userOrUserId)
            .select('securityStamp')
            .lean()
            .exec()
        : userOrUserId;

    if (!securityStamp) {
      throw new Error('Security stamp not found.');
    }

    await this.redisService.db.zRem(SECURITY_STAMPS_REDIS_KEY, securityStamp);

    // Generate a new security stamp and update the user
    const newSecurityStamp = Random.generateSecurityStamp();
    await this.userModel
      .findByIdAndUpdate(
        typeof userOrUserId === 'string' ? userOrUserId : userOrUserId.id,
        { securityStamp: newSecurityStamp },
        { select: { id: true } },
      )
      .exec();
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<ReturnType<UsersService['findByUniqueWithDetail']> | null> {
    const user = await this.usersService.findByUniqueWithDetail({ email });

    if (!user?.password || !(await compare(password, user.password))) {
      return null;
    }

    return user;
  }

  async generateAccessToken(
    user: Awaited<ReturnType<UsersService['findByUniqueWithDetail']>>,
  ): Promise<string> {
    const payload = {
      sub: user.id,
      username: user.username,
      displayName: user.displayName,
      hasPassword: !!user.password,
      email: user.email,
      emailConfirmed: user.emailConfirmed,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate,
      roles: user.userRoles,
      photoUrl: user.photoUrl,
      coverUrl: user.coverUrl,
      themeSource: user.themeSource,
      themeStyle: user.themeStyle,
      securityStamp: user.securityStamp,
    };

    return this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(
    userId: string,
    ipAddress: string,
  ): Promise<string> {
    const expirationDate = dayjs()
      .add(this.configService.get('REFRESH_TOKEN_EXPIRES', 2592000), 'seconds')
      .toDate();

    const refreshToken = new this.refreshTokenModel({
      expires: expirationDate,
      createdByIp: ipAddress,
      token: createCustomTokenGenerator(256),
      user: userId,
    });

    await refreshToken.save();
    return refreshToken.token.toString();
  }

  async hashPassword(password: string) {
    const salt = await genSalt(10);
    return hash(password, salt);
  }

  async sendConfirmEmail(user: {
    id: string;
    displayName: string;
    email: string;
  }) {
    const expires = dayjs().add(7, 'days');

    const { token } = await this.verificationTokensService.generateToken(
      user.id,
      VerificationTokenType.VERIFY_EMAIL,
      expires.toDate(),
    );

    const to = user.email;
    const from = this.mailService.sender;

    const confirmationLink = new URL(
      this.configService.get('CONFIRM_EMAIL_URL'),
    );
    confirmationLink.searchParams.set('token', token);

    const html = await this.mailService.renderTemplate('confirm-email', {
      displayName: user.displayName,
      expires: expires.utc().format('YYYY-MM-DD HH:mm:ss'),
      confirmationLink: confirmationLink.toString(),
      userEmail: to,
      supportEmail: from,
    });

    await this.mailService.send({
      subject: 'Confirm Email!',
      from: from,
      to: to,
      html,
    });
  }

  async confirmEmail(dto: ConfirmEmailDto) {
    const verificationToken =
      await this.verificationTokensService.getTokenActive(
        dto.token,
        VerificationTokenType.VERIFY_EMAIL,
      );

    const user = await this.userModel
      .findByIdAndUpdate(
        verificationToken.userId,
        { emailConfirmed: true },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new Error('User not found.');
    }

    // Revoke the verification token after successful confirmation
    await this.verificationTokensService.revokeToken(
      dto.token,
      VerificationTokenType.VERIFY_EMAIL,
    );

    this.logger.log(`[ConfirmEmail]: ${user.email}`);

    return { email: user.email };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByUniqueWithDetail({
      email: dto.email,
    });

    if (!user || !user.emailConfirmed) {
      throw new AppError.Argument(messages.error.forgotPassword);
    }

    // Generate a reset password token
    const { token } = await this.verificationTokensService.generateToken(
      user.id,
      VerificationTokenType.RESET_PASSWORD,
    );

    // Generate the password reset link
    const from = this.mailService.sender;
    const to = user.email;
    const resetLink = new URL(this.configService.get('RESET_PASSWORD_URL'));
    resetLink.searchParams.set('token', token);

    const html = await this.mailService.renderTemplate('forgot-password', {
      username: user.username,
      resetLink: resetLink.toString(),
      userEmail: to,
      supportEmail: from,
    });

    // Send the password reset email
    await this.mailService.send({
      subject: 'Forgot Password?',
      from: from,
      to: to,
      html,
    });

    this.logger.log(`[ForgotPassword]: ${user.username}`);

    return { email: user.email };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const [verificationToken, hashPassword] = await Promise.all([
      this.verificationTokensService.getTokenActive(
        dto.token,
        VerificationTokenType.RESET_PASSWORD,
      ),
      this.hashPassword(dto.password),
    ]);

    // Update the user's password
    const user = await this.userModel
      .findByIdAndUpdate(
        verificationToken.userId,
        { password: hashPassword },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new Error('User not found.');
    }

    // Update the security stamp and revoke the token
    await Promise.all([
      this.updateSecurityStamp({
        id: user._id.toString(),
        securityStamp: user.securityStamp,
      }),
      this.verificationTokensService.revokeToken(
        dto.token,
        VerificationTokenType.RESET_PASSWORD,
      ),
    ]);

    this.logger.log(`[ResetPassword]: ${user.email}`);

    return { email: user.email };
  }

  async register(dto: RegisterDto) {
    return runInTransaction(this.connection, async (session) => {
      const [hashPassword, role] = await Promise.all([
        this.hashPassword(dto.password),
        this.roleModel
          .findOne({ name: dto.isAdmin ? 'user' : 'admin' })
          .session(session)
          .exec(),
      ]);

      if (!role) {
        throw new AppError.BadQuery('Default "User" role not found');
      }

      // Create the user and userRole in a transaction
      const newUser = new this.userModel({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashPassword,
        securityStamp: Random.generateSecurityStamp(),
      });

      const userRole = new this.userRoleModel({
        userId: newUser._id,
        roleId: [new Types.ObjectId(role._id as string)],
        roles: [role.name],
      });

      newUser.userRoles.push(userRole._id as Types.ObjectId);

      await Promise.all([
        newUser.save({ session }),
        userRole.save({ session }),
      ]);

      const result = {
        id: newUser._id.toString(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        displayName: newUser.displayName,
        email: newUser.email,
      };

      // Send confirmation email if email is provided
      if (dto.email) {
        await this.sendConfirmEmail(result);
      }

      this.logger.log(`[Register]: ${result.email}`);
      return {
        ...result,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };
    });
  }

  async login(
    user: Awaited<ReturnType<UsersService['findByUniqueWithDetail']>>,
    ipAddress: string,
  ) {
    this.logger.log(`[Login]:${user.email}`);
    return {
      accessToken: await this.generateAccessToken(user),
      refreshToken: await this.generateRefreshToken(user.id, ipAddress),
    };
  }

  private async revokeRefreshToken(
    oldTokenId: string,
    ip: string,
    session: ClientSession,
    newToken?: string,
  ) {
    await this.refreshTokenModel
      .findByIdAndUpdate(
        oldTokenId,
        {
          revoked: new Date(),
          revokedByIp: ip,
          replaceByToken: newToken,
        },
        { session },
      )
      .exec();
  }

  async refreshToken(token: string, ip: string) {
    const session = await this.refreshTokenModel.startSession();
    session.startTransaction();

    try {
      const oldRefreshToken = await this.refreshTokenModel
        .findOne({ token })
        .populate({
          path: 'user',
          populate: {
            path: 'userRoles',
            populate: {
              path: 'roleId',
            },
          },
        })
        .session(session)
        .exec();

      if (!oldRefreshToken) {
        throw new AppError.NotFound();
      }

      if (
        oldRefreshToken.revoked ||
        dayjs(oldRefreshToken.expires).isSameOrBefore(dayjs())
      ) {
        throw new AppError.Argument(messages.error.refreshToken);
      }

      const user = oldRefreshToken.user as unknown as User;

      const accessToken = await this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(
        user._id.toString(),
        ip,
      );
      await this.revokeRefreshToken(
        oldRefreshToken._id.toString(),
        ip,
        session,
        newRefreshToken,
      );

      this.logger.log(`[RefreshToken]: ${user.email}`);

      await session.commitTransaction();
      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async revoke(token: string, userId: string, ip: string) {
    const session = await this.refreshTokenModel.startSession();
    session.startTransaction();

    try {
      const refreshToken = await this.refreshTokenModel
        .findOne({ token })
        .select('id expires revoked user')
        .populate({
          path: 'user',
          select: 'id email',
        })
        .session(session)
        .exec();

      if (!refreshToken) {
        throw new AppError.NotFound();
      }

      if (
        (
          refreshToken.user as unknown as {
            _id: Types.ObjectId;
            email: string;
          }
        )?._id?.toString() !== userId.toString()
      ) {
        throw new AppError.Argument(messages.error.refreshToken);
      }

      if (
        refreshToken.revoked ||
        dayjs(refreshToken.expires).isSameOrBefore(dayjs())
      ) {
        throw new AppError.Argument(messages.error.refreshToken);
      }

      await this.revokeRefreshToken(refreshToken.id, ip, session);
      this.logger.log(
        `[RevokeToken]: ${(refreshToken.user as unknown as User).email}`,
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private getImageCacheKey(email: string, type: 'photo' | 'cover') {
    return `user:${email}:${type}`;
  }

  async getImageLink(dto: SearchImageDto, user: AuthUser) {
    const fieldName = dto.type === 'photo' ? 'photoUrl' : 'coverUrl';

    const result = await this.usersService.findByUnique({
      email: user.email,
    });

    if (!result) {
      throw new AppError.NotFound();
    }

    return this.cacheManager.wrap(
      this.getImageCacheKey(user.email, dto.type),
      () => this.cloudStorageService.getTemporaryLink(result[fieldName]),
      AuthFile.CACHE_TIME,
    );
  }

  async updateImage(image: IFile, dto: UpdateImageDto, user: AuthUser) {
    const fieldName = dto.type === 'photo' ? 'photoUrl' : 'coverUrl';

    const result = await this.cloudStorageService.fileUpload(image, {
      path: user.id,
      mode: { '.tag': 'overwrite' },
    });
    await this.cacheManager.del(this.getImageCacheKey(user.email, dto.type));

    await this.userModel
      .findByIdAndUpdate(
        user.id,
        {
          [fieldName]: result.pathDisplay,
        },
        { new: true },
      )
      .exec();
  }

  async updatePassword(
    dto: UpdatePasswordDto,
    userId: string,
    ipAddress: string,
  ) {
    const user = await this.userModel
      .findById(userId)
      .select(userDetailSelect)
      .populate('userRoles')
      .exec();

    if (!user) {
      throw new AppError.NotFound(messages.error.userNotFound);
    }

    const hasPassword = !!user.password;

    if (
      hasPassword &&
      (!dto.currentPassword ||
        !(await compare(dto.currentPassword, user.password)))
    ) {
      throw new AppError.Argument(messages.error.currentPassword);
    }

    user.password = await this.hashPassword(dto.newPassword);
    user.securityStamp = Random.generateSecurityStamp();
    await user.save();

    this.logger.log(`[UpdatePassword]: ${user.email}`);

    await this.redisService.db.zRem(
      SECURITY_STAMPS_REDIS_KEY,
      user.securityStamp,
    );

    return this.login(user, ipAddress);
  }

  async updateEmail(dto: UpdateEmailDto, userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('id username email')
      .exec();

    if (!user) {
      throw new AppError.NotFound('User not found');
    }

    if (dto.email === user.email) {
      throw new AppError.Argument(messages.error.sameEmailAddressProvided);
    }

    user.email = dto.email;
    user.emailConfirmed = false;
    await user.save();

    await this.sendConfirmEmail({
      id: user.id,
      displayName: user.displayName,
      email: dto.email,
    });

    this.logger.log(`[UpdateEmail]: ${user.displayName}`);
  }

  async requestVerifyEmail(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('id username email emailConfirmed')
      .exec();

    if (!user) {
      throw new AppError.NotFound('User not found');
    }

    if (!user.email || user.emailConfirmed) {
      throw new AppError.Argument(messages.warning.requestVerifyEmail);
    }

    // Send the confirmation email
    await this.sendConfirmEmail({
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
    });
    this.logger.log(`[RequestVerifyEmail]: ${user.displayName}`);

    return { email: user.email };
  }
}
