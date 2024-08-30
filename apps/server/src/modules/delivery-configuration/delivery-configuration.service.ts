import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import {
  PaginationService,
  PopulateField,
} from 'helpers/pagination/pagination.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { REDIS_TTL } from 'constants/global';
import {
  DeliveryConfiguration,
  DeliveryConfigurationDocument,
} from './schema/delivery-configuration.schema';
import { SearchDeliveryConfigDto } from './dto/query-delivery-configuration.dto';
import { categorySelect } from 'modules/category/constants';
import { CreateDeliveryConfigDto } from './dto/create-delivery-configuration.dto';
import { CategoryService } from 'modules/category/category.service';
import { AppError } from 'common/errors';
import { configSelect } from './constants';
import { UpdateDeliveryConfigurationDto } from './dto/update-delivery-configuration.dto';
import { runInTransaction } from 'utils';

@Injectable()
export class DeliveryConfigurationService {
  private readonly CACHE_KEY = 'delivery-configurations';

  constructor(
    @InjectModel(DeliveryConfiguration.name)
    private deliveryConfigModel: Model<DeliveryConfigurationDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectConnection() private connection: Connection,
    private paginationService: PaginationService,
    private categoryService: CategoryService,
  ) {}

  /**
   * @description Retrieves all delivery configurations based on query options such as filters, sorting, and pagination.
   */
  async findAll(queryOptions: SearchDeliveryConfigDto): Promise<any> {
    const {
      search,
      category,
      isActive,
      skip,
      take,
      sort: sortOptions,
    } = queryOptions;

    const matchFilter: any = {};

    // Search filter for category name or flat rate
    if (search) {
      matchFilter.$or = [
        { 'category.name': { $regex: search, $options: 'i' } },
        { flatRate: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category ID
    if (category) {
      matchFilter.category = new Types.ObjectId(category);
    }

    // Filter by active/inactive status
    if (isActive !== undefined) {
      matchFilter.isActive = isActive;
    }

    // Set pagination and sorting
    const pagination = { page: skip, perPage: take };
    const sort = {
      [sortOptions.field]: sortOptions.order,
    };

    // Cache key based on query options
    const cacheKey = `${this.CACHE_KEY}:${JSON.stringify(queryOptions)}`;

    // Populate category field
    const populatedField: PopulateField[] = [
      {
        from: 'categories',
        localField: 'category',
        unwind: true,
        project: categorySelect,
      },
    ];

    return this.cacheManager.wrap(
      cacheKey,
      () =>
        this.paginationService.getPaginatedQueryResponse(
          this.deliveryConfigModel,
          matchFilter,
          pagination,
          populatedField,
          configSelect,
          sort,
        ),
      REDIS_TTL,
    );
  }

  /**
   * @description Retrieves a specific delivery configuration by its ID.
   */
  async findOne(id: string): Promise<any> {
    const cacheKey = `${this.CACHE_KEY}:${id}`;
    return this.cacheManager.wrap(
      cacheKey,
      async () => {
        const product = await this.deliveryConfigModel
          .findById(id)
          .select(configSelect)
          .populate({ path: 'category', select: categorySelect })
          .lean()
          .exec();

        if (!product) {
          throw new AppError.NotFound(
            `Delivery configurations with ID '${id}' not found.`,
          );
        }
        return product;
      },
      REDIS_TTL,
    );
  }

  /**
   * @description Creates a new delivery configuration. Validates the category, checks for conflicts, and handles cache invalidation.
   */
  async create(
    createDeliveryConfigDto: CreateDeliveryConfigDto,
  ): Promise<DeliveryConfiguration> {
    const { category, flatRate, regionSpecificRates, applicablePostcodes } =
      createDeliveryConfigDto;

    const categoryExists = await this.categoryService.findOne(category);
    if (!categoryExists) {
      throw new AppError.NotFound(`Category with ID '${category}' not found.`);
    }

    //  Check if a delivery configuration already exists for this category
    const existingConfig = await this.deliveryConfigModel
      .findOne({ category: new Types.ObjectId(category) })
      .exec();
    if (existingConfig) {
      throw new AppError.Conflict(
        `A delivery configuration for the category '${categoryExists.name}' already exists.`,
      );
    }

    // Ensure that at least one of flat rate or region-specific rates is provided
    if (!flatRate && !regionSpecificRates) {
      throw new AppError.BadQuery(
        'Either a flat rate or region-specific rates must be provided.',
      );
    }

    const newDeliveryConfig = new this.deliveryConfigModel({
      category: new Types.ObjectId(category),
      flatRate,
      regionSpecificRates,
      applicablePostcodes,
      isActive: createDeliveryConfigDto.isActive ?? true,
    });

    const savedConfig = await newDeliveryConfig.save();

    // Invalidate relevant cache
    await this.cacheManager.del(this.CACHE_KEY);

    return savedConfig;
  }

  /**
   * @description Updates a delivery configuration by its ID.
   */
  async update(
    id: string,
    updateDeliveryConfigDto: UpdateDeliveryConfigurationDto,
  ): Promise<DeliveryConfiguration> {
    const existingConfig = await this.deliveryConfigModel.findById(id).exec();

    if (!existingConfig) {
      throw new AppError.NotFound(
        `Delivery configuration with ID '${id}' not found.`,
      );
    }

    // Validate and check if the category exists (if updating category)
    if (updateDeliveryConfigDto.category) {
      const categoryExists = await this.categoryService.findOne(
        updateDeliveryConfigDto.category,
      );
      if (!categoryExists) {
        throw new AppError.NotFound(
          `Category with ID '${updateDeliveryConfigDto.category}' not found.`,
        );
      }

      // Ensure no conflicting configurations for the new category
      const conflictingConfig = await this.deliveryConfigModel
        .findOne({
          category: updateDeliveryConfigDto.category,
          _id: { $ne: id }, // Exclude the current configuration
        })
        .exec();

      if (conflictingConfig) {
        throw new AppError.Conflict(
          `A delivery configuration for the category '${categoryExists.name}' already exists.`,
        );
      }
    }

    // Ensure that at least one of flat rate or region-specific rates is provided
    if (
      !updateDeliveryConfigDto.flatRate &&
      !updateDeliveryConfigDto.regionSpecificRates
    ) {
      throw new AppError.BadQuery(
        'Either a flat rate or region-specific rates must be provided.',
      );
    }

    Object.assign(existingConfig, updateDeliveryConfigDto);
    const updatedConfig = await existingConfig.save();

    // Invalidate cache after update
    await this.cacheManager.del('delivery-configurations');

    return updatedConfig;
  }

  /**
   * @description Deletes a delivery configuration by its ID.
   */
  async remove(id: string): Promise<void> {
    await runInTransaction(this.connection, async (session) => {
      const config = await this.deliveryConfigModel
        .findById(id)
        .session(session)
        .exec();

      if (!config) {
        throw new AppError.NotFound(
          `Delivery configuration with ID '${id}' not found.`,
        );
      }

      await this.deliveryConfigModel
        .deleteOne({ _id: id })
        .session(session)
        .exec();

      // Invalidate cache after deletion
      await this.cacheManager.del('delivery-configurations');
    });
  }
}
