import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cache } from 'cache-manager';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SearchCategoriesDto } from './dtos/query.dto';
import { AppError } from 'common/errors';
import _ from 'lodash';
import { generateSlug } from 'utils';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { categorySelect, categorySelectDetails } from './constants';
import { ISort, PaginationType } from 'helpers/pagination/pagination.types';
import { PaginationService } from 'helpers/pagination/pagination.service';
import { REDIS_TTL } from 'constants/global';
import { RedisService } from 'core/redis/redis.service';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class CategoryService {
  private readonly CACHE_KEY = 'categories';

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private paginationService: PaginationService,
    private redisService: RedisService,
  ) {}

  private async validateParentCategory(
    parentCategoryId: string,
  ): Promise<void> {
    if (parentCategoryId) {
      const parentCategory = await this.categoryModel
        .findById(parentCategoryId)
        .exec();
      if (!parentCategory) {
        throw new AppError.NotFound(
          `Parent category with ID ${parentCategoryId} not found`,
          'parent_category_not_found',
        );
      }
    }
  }

  async findAll(queryOptions: SearchCategoriesDto): Promise<any> {
    const { search, sort, skip, take, ...filter } = queryOptions;

    console.log({ sort });

    // Build match filter for MongoDB query
    const matchFilter: any = {};

    // Add search filter (case-insensitive search on name and description)
    if (search) {
      matchFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Add other filters
    if (filter?.isActive !== undefined) {
      matchFilter.isActive = filter.isActive;
    }
    if (filter?.parentCategory) {
      matchFilter.parentCategory = filter.parentCategory;
    }

    // Set pagination parameters
    const pagination: PaginationType = {
      page: skip || 1,
      perPage: take || 10,
    };

    // Define population options (if needed)
    const populateFields = [
      { localField: 'parentCategory', from: 'categories', unwind: true },
      { localField: 'relatedCategories', from: 'categories', unwind: true },
    ];

    const CACHE_KEY = `${this.CACHE_KEY}:${JSON.stringify(queryOptions)}`;
    return this.cacheManager.wrap(
      CACHE_KEY,
      async () =>
        this.paginationService.getPaginatedQueryResponse(
          this.categoryModel,
          matchFilter,
          pagination,
          populateFields,
          categorySelect,
          { [sort.field]: sort.order } as unknown as ISort,
        ),
      REDIS_TTL,
    );
  }

  async findOne(idOrSlug: string): Promise<Category> {
    const cacheKey = `${this.CACHE_KEY}:${idOrSlug}`;

    return await this.cacheManager.wrap(
      cacheKey,
      async () => {
        const category = await this.categoryModel
          .findOne({
            $or: [
              ...(isValidObjectId(idOrSlug)
                ? [{ _id: new Types.ObjectId(idOrSlug) }]
                : []),
              { slug: idOrSlug },
            ],
          })
          .populate({
            path: 'parentCategory relatedCategories',
            select: categorySelect,
          })
          .select(categorySelectDetails)
          .exec();
        if (!category) {
          throw new AppError.NotFound(
            `Category with ID ${idOrSlug} not found`,
            'category_not_found',
          );
        }
        return category;
      },
      REDIS_TTL,
    );
  }

  async create(
    userId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    // Check for duplicate category names (case-insensitive)
    const existingCategory = await this.categoryModel
      .findOne({
        name: {
          $regex: new RegExp(
            `^${_.escapeRegExp(createCategoryDto.name)}$`,
            'i',
          ),
        },
      })
      .exec();

    if (existingCategory) {
      throw new AppError.Conflict(
        `Category with the name "${createCategoryDto.name}" already exists.`,
        'conflict',
      );
    }

    await this.validateParentCategory(createCategoryDto.parentCategory);

    const slug = generateSlug(createCategoryDto.name);

    const newCategory = new this.categoryModel({
      ...createCategoryDto,
      author: new Types.ObjectId(userId),
      slug,
    });

    const category = await newCategory.save();

    await this.cacheManager.del(this.CACHE_KEY);

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // Validate the parent category if provided
    if (updateCategoryDto.parentCategory) {
      await this.validateParentCategory(updateCategoryDto.parentCategory);
    }

    // Check if a category with the updated name already exists (case-insensitive)
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryModel
        .findOne({
          _id: { $ne: id }, // Exclude the current category
          name: {
            $regex: new RegExp(
              `^${_.escapeRegExp(updateCategoryDto.name)}$`,
              'i',
            ),
          },
        })
        .exec();

      if (existingCategory) {
        throw new AppError.Conflict(
          `Category with the name "${updateCategoryDto.name}" already exists.`,
          'conflict',
        );
      }
    }

    // Generate a new slug if the name is updated
    let updatedSlug = undefined;
    if (updateCategoryDto.name) {
      updatedSlug = generateSlug(updateCategoryDto.name);
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(
        id,
        {
          ...updateCategoryDto,
          parentCategory: new Types.ObjectId(updateCategoryDto.parentCategory),
          relatedCategories: updateCategoryDto?.relatedCategories.flat(),
          ...(updatedSlug && { slug: updatedSlug }),
        },
        { new: true },
      )
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Invalidate the categories cache and the specific category cache
    await this.cacheManager.del(this.CACHE_KEY);
    await this.cacheManager.del(`${this.CACHE_KEY}:${id}`);

    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(
        `Category with ID '${id}' not found. Please verify the ID and try again.`,
      );
    }

    // Check if the category has child categories that reference it
    const childCategories = await this.categoryModel
      .find({ parentCategory: id })
      .exec();

    if (childCategories.length > 0) {
      await this.categoryModel.updateMany(
        { parentCategory: id },
        { $unset: { parentCategory: 1 } },
      );
    }

    const result = await this.categoryModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(
        `Category with ID '${id}' not found. Please verify the ID and try again.`,
      );
    }

    await this.cacheManager.del(`${this.CACHE_KEY}:${id}`);
    for (const child of childCategories) {
      await this.cacheManager.del(`${this.CACHE_KEY}:${child._id}`);
    }
    await this.cacheManager.del(this.CACHE_KEY);
    return;
  }
}
