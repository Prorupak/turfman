import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppError } from 'common/errors';
import {
  CreateRoleDto,
  DeleteRoleDto,
  SearchRoleDto,
  SortRoleDto,
  UpdateRoleDto,
} from './dtos';
import { Role, RoleDocument } from './schemas/roles.schema';
import { roleSelect } from './constants';
import { messages } from 'constants/messages';
import { RoleDto } from './dtos/role.dto';

@Injectable()
export class RolesService {
  private logger = new Logger(RolesService.name);

  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async findAll(): Promise<RoleDto[]> {
    const roles = await this.roleModel
      .find()
      .sort({ sort: 'asc' })
      .select(roleSelect)
      .lean()
      .exec();

    return roles.map((role) => ({
      name: role.name,
      sort: role.sort,
      default: role.default,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      id: role.id,
    })) as RoleDto[];
  }

  async findById(dto: SearchRoleDto): Promise<RoleDto> {
    const role = await this.roleModel
      .findById(dto.id)
      .select(roleSelect)
      .lean()
      .exec();

    if (!role) {
      throw new AppError.NotFound(messages.error.notFoundEntity).setParams({
        entity: 'Role',
        id: dto.id,
      });
    }

    return {
      name: role?.name,
      sort: role?.sort,
      default: role?.default,
      createdAt: role?.createdAt,
      updatedAt: role?.updatedAt,
      id: role?.id?.toString(),
    };
  }

  async maxSort() {
    const result = await this.roleModel
      .findOne()
      .sort({ sort: -1 })
      .select('sort')
      .exec();
    return result ? result.sort : 0;
  }

  async create(dto: CreateRoleDto): Promise<RoleDto> {
    const session = await this.roleModel.startSession();
    session.startTransaction();

    try {
      const maxSort = await this.maxSort();

      const res = await this.roleModel.create({
        name: dto.name,
        sort: maxSort !== null ? maxSort + 1 : 1,
      });

      const role = res;
      this.logger.log(`[Create]: ${role.name}`);
      await session.commitTransaction();
      return {
        name: role.name,
        sort: role.sort,
        default: role.default,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        id: role?._id?.toString(),
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async update(dto: UpdateRoleDto): Promise<RoleDto> {
    const session = await this.roleModel.startSession();
    session.startTransaction();

    try {
      const currentRole = await this.findById({ id: dto.id });

      if (currentRole.default) {
        throw new AppError.Argument(messages.warning.defaultData);
      }

      const role = await this.roleModel
        .findByIdAndUpdate(
          currentRole.id,
          { name: dto.name },
          { new: true, session },
        )
        .select(roleSelect)
        .exec();

      this.logger.log(`[Update]: ${role?.name}`);
      await session.commitTransaction();
      return {
        name: role?.name,
        sort: role?.sort,
        default: role?.default,
        createdAt: role?.createdAt,
        updatedAt: role?.updatedAt,
        id: role?.id?.toString(),
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async delete(dto: DeleteRoleDto) {
    const session = await this.roleModel.startSession();
    session.startTransaction();

    try {
      const currentRole = await this.findById({ id: dto.id });

      if (currentRole.default) {
        throw new AppError.Argument(messages.warning.defaultData);
      }

      const role = await this.roleModel
        .findByIdAndDelete(dto.id, { session })
        .select(roleSelect)
        .exec();

      await this.roleModel.updateMany(
        { sort: { $gt: role.sort } },
        { $inc: { sort: -1 } },
        { session },
      );

      this.logger.warn(`[Delete]: ${role.name}`);
      await session.commitTransaction();
      return role;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async sort(dto: SortRoleDto) {
    const session = await this.roleModel.startSession();
    session.startTransaction();

    try {
      const maxSort = await this.maxSort();

      if (dto.sort > maxSort) {
        throw new AppError.Argument(messages.error.changeSort).setErrors([
          `Max sort is ${maxSort}, current sort is ${dto.sort}`,
        ]);
      }

      const newSort = dto.sort;
      const currentRole = await this.roleModel
        .findById(dto.id)
        .select('sort')
        .exec();

      if (!currentRole) {
        throw new AppError.NotFound(messages.error.notFoundEntity).setParams({
          entity: 'Role',
          id: dto.id,
        });
      }

      const oldSort = currentRole.sort;

      if (oldSort < newSort) {
        await this.roleModel.updateMany(
          { sort: { $lte: newSort, $gt: oldSort } },
          { $inc: { sort: -1 } },
          { session },
        );
      } else if (oldSort > newSort) {
        await this.roleModel.updateMany(
          { sort: { $gte: newSort, $lt: oldSort } },
          { $inc: { sort: 1 } },
          { session },
        );
      } else {
        throw new AppError.Argument(messages.warning.noChange);
      }

      const role = await this.roleModel
        .findByIdAndUpdate(dto.id, { sort: dto.sort }, { new: true, session })
        .select(roleSelect)
        .exec();

      this.logger.warn(`[Sort]: ${role.name}`);
      await session.commitTransaction();
      return role;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
