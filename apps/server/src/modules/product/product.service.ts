import { Injectable, Inject } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Cache } from 'cache-manager';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { REDIS_TTL } from 'constants/global';
import {
  PaginationService,
  PopulateField,
} from 'helpers/pagination/pagination.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SearchProductsDto } from './dto/query-products';
import { generateSlug, runInTransaction } from 'utils';
import { CategoryService } from 'modules/category/category.service';
import { AppError } from 'common/errors';
import {
  Category,
  CategoryDocument,
} from 'modules/category/schemas/category.schema';
import {
  categorySelect,
  productSelectDetails,
  productSelectMinimal,
} from './constants';
import { PaginatedProductDetailsResponseDto } from './dto/product-reponse.dto';
import { PaginationType } from '@buzz/types';

@Injectable()
export class ProductService {
  private readonly CACHE_KEY = 'products';

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private paginationService: PaginationService,
    @InjectConnection() private connection: Connection,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private categoryService: CategoryService,
  ) {}

  async findAll(
    queryOptions: SearchProductsDto,
  ): Promise<PaginatedProductDetailsResponseDto> {
    const {
      search,
      category,
      priceRange,
      inStock,
      isActive,
      variantAttributes,
      skip,
      take,
      sort: sortOptions,
    } = queryOptions;

    const matchFilter: any = {};

    // Search filter for name or SKU
    if (search) {
      matchFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category) {
      matchFilter.category = new Types.ObjectId(category);
    }

    // Filter by price range
    if (priceRange) {
      matchFilter.$and = matchFilter.$and || [];
      matchFilter.$and.push({
        $or: [
          { price: { $gte: priceRange.min, $lte: priceRange.max } },
          {
            'variantDetails.price': {
              $gte: priceRange.min,
              $lte: priceRange.max,
            },
          },
        ],
      });
    }

    // Filter by stock availability
    if (inStock !== undefined) {
      matchFilter.stock = inStock ? { $gt: 0 } : 0;
    }

    // Filter by active/archived status
    if (isActive !== undefined) {
      matchFilter.isActive = isActive;
    }

    // Filter by variant attributes (e.g., size: small, color: red)
    if (variantAttributes) {
      const variantMatch: any[] = [];
      for (const [key, value] of Object.entries(variantAttributes)) {
        variantMatch.push({ [`variantDetails.attributes.${key}`]: value });
      }
      if (variantMatch.length > 0) {
        matchFilter.$and = matchFilter.$and || [];
        matchFilter.$and.push({ $and: variantMatch });
      }
    }

    // Set pagination and sorting
    const pagination: PaginationType = { page: skip, perPage: take };
    const sort = {
      [sortOptions.field]: sortOptions.order,
    };

    // Lookup stage for category
    const populatedField: PopulateField[] = [
      {
        from: 'categories',
        localField: 'category',
        unwind: true,
        project: categorySelect,
      },
    ];

    // Cache key based on query options
    const cacheKey = `${this.CACHE_KEY}:${JSON.stringify(queryOptions)}`;

    return this.cacheManager.wrap(
      cacheKey,
      () =>
        this.paginationService.getPaginatedQueryResponse(
          this.productModel,
          matchFilter,
          pagination,
          populatedField,
          productSelectMinimal,
          sort,
        ) as unknown as Promise<PaginatedProductDetailsResponseDto>,
      REDIS_TTL,
    );
  }

  async findOne(id: string): Promise<any> {
    const cacheKey = `${this.CACHE_KEY}:${id}`;
    return this.cacheManager.wrap(
      cacheKey,
      async () => {
        const product = await this.productModel
          .findById(id)
          .select(productSelectDetails)
          .populate({ path: 'category', select: categorySelect })
          .populate({ path: 'relatedProducts', select: productSelectMinimal })
          .lean()
          .exec();
        if (!product) {
          throw new AppError.NotFound(`Product with ID '${id}' not found.`);
        }
        return product;
      },
      REDIS_TTL,
    );
  }

  async create(
    userId: string,
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    const existingProduct = await this.productModel
      .findOne({
        $or: [
          { name: { $regex: new RegExp(`^${createProductDto.name}$`, 'i') } },
          { sku: createProductDto.sku },
        ],
      })
      .lean()
      .exec();

    if (existingProduct) {
      throw new AppError.Conflict(
        `A product with the name '${createProductDto.name}' or SKU '${createProductDto.sku}' already exists.`,
        'existing_product',
      );
    }

    const category = await this.categoryService.findOne(
      createProductDto.category,
    );
    if (!category) {
      throw new AppError.NotFound(
        `Category with ID '${createProductDto.category}' not found.`,
        'category_not_found',
      );
    }

    // Validate related products (if any)
    if (createProductDto.relatedProducts) {
      for (const relatedProductId of createProductDto.relatedProducts) {
        const relatedProduct = await this.productModel
          .findById(relatedProductId)
          .exec();
        if (!relatedProduct) {
          throw new AppError.NotFound(
            `Related product with ID '${relatedProductId}' not found.`,
          );
        }
      }
    }

    const slug = generateSlug(createProductDto.name);

    // Normalize fields (e.g., lowercase name for consistent querying)
    createProductDto.name = createProductDto.name.toLowerCase();

    const newProduct = new this.productModel({
      ...createProductDto,
      author: new Types.ObjectId(userId),
      category: new Types.ObjectId(createProductDto.category),
      slug,
    });

    // Pre-calculate total stock from variant details if available
    if (
      createProductDto.variantDetails &&
      createProductDto.variantDetails.length > 0
    ) {
      newProduct.stock = createProductDto.variantDetails.reduce(
        (total, variant) => total + variant.quantity,
        0,
      );
    }

    const product = await newProduct.save();

    // Invalidate cache after creating a product
    await this.cacheManager.del(this.CACHE_KEY);

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const existingProduct = await this.productModel.findById(id).exec();
    if (!existingProduct) {
      throw new AppError.NotFound(
        `Product with ID '${id}' not found.`,
        'product_not_found',
      );
    }

    // Check for conflicts with other products (name or SKU)
    if (updateProductDto.name || updateProductDto.sku) {
      const conflictCheck = await this.productModel
        .findOne({
          $or: [
            { name: { $regex: new RegExp(`^${updateProductDto.name}$`, 'i') } },
            { sku: updateProductDto.sku },
          ],
          _id: { $ne: id }, // Exclude the current product from the conflict check
        })
        .exec();

      if (conflictCheck) {
        throw new AppError.Conflict(
          `A product with the name '${updateProductDto.name}' or SKU '${updateProductDto.sku}' already exists.`,
          'existing_product',
        );
      }
    }

    // Validate the category if it’s being updated
    if (updateProductDto.category) {
      const category = await this.categoryService.findOne(
        updateProductDto.category,
      );
      if (!category) {
        throw new AppError.NotFound(
          `Category with ID '${updateProductDto.category}' not found.`,
          'category_not_found',
        );
      }
    }

    // Validate related products (if any are updated)
    if (updateProductDto.relatedProducts) {
      for (const relatedProductId of updateProductDto.relatedProducts) {
        const relatedProduct = await this.productModel
          .findById(relatedProductId)
          .exec();
        if (!relatedProduct) {
          throw new AppError.NotFound(
            `Related product with ID '${relatedProductId}' not found.`,
            'product_not_found',
          );
        }
      }
    }

    let updatedSlug: string;
    if (updateProductDto.name) {
      updatedSlug = generateSlug(updateProductDto.name);
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id,
        {
          ...updateProductDto,
          ...(updatedSlug && { slug: updatedSlug }), // Only update the slug if the name has changed
        },
        { new: true },
      )
      .exec();

    if (!updatedProduct) {
      throw new AppError.NotFound(
        `Product with ID '${id}' not found.`,
        'product_not_found',
      );
    }

    // Recalculate total stock from variant details if applicable
    if (
      updateProductDto.variantDetails &&
      updateProductDto.variantDetails.length > 0
    ) {
      updatedProduct.stock = updateProductDto.variantDetails.reduce(
        (total, variant) => total + variant.quantity,
        0,
      );
    }

    await updatedProduct.save();

    // Invalidate cache after updating the product
    await this.cacheManager.del(this.CACHE_KEY);
    await this.cacheManager.del(`${this.CACHE_KEY}:${id}`);

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    return runInTransaction(
      this.connection,
      async (session) => {
        const product = await this.productModel
          .findOne({ _id: id })
          .session(session)
          .exec();

        if (!product) {
          throw new AppError.NotFound(
            `Product with ID '${id}' not found or has been modified by another process.`,
          );
        }

        const [, , result] = await Promise.all([
          // Handle cascading updates or deletions
          this.productModel.updateMany(
            {
              relatedProducts: id,
              $and: [{ relatedProducts: { $type: 'array' } }],
            },
            { $pull: { relatedProducts: id } },
            { session },
          ),
          // Remove the product reference from the category
          this.categoryModel.updateMany(
            {
              _id: product.category,
              $and: [{ products: { $type: 'array' } }],
            },
            { $pull: { products: id } },
            { session },
          ),
          this.productModel
            .findOneAndDelete({ _id: id })
            .session(session)
            .exec(),
        ]);

        if (!result) {
          throw new AppError.Argument(
            `Product with ID '${id}' has been modified by another process. Please refresh and try again.`,
          );
        }

        // Invalidate cache for the deleted product and any related caches
        await this.cacheManager.del(this.CACHE_KEY);
        await this.cacheManager.del(`${this.CACHE_KEY}:${id}`);

        return;
      },
      {
        retries: 2, // Retry up to 2 times
        onRetry: (attempt, error) => {
          console.error(
            `Attempt ${attempt} failed during product deletion:`,
            error.message,
          );
        },
      },
    );
  }

  /**
   * @description Decreases the stock quantity for a specific product.
   */
  async decreaseStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.productModel.findById(productId).exec();

    if (!product) {
      throw new AppError.NotFound(`Product with ID '${productId}' not found.`);
    }

    // Check if there is enough stock to fulfill the order
    if (product.stock < quantity) {
      throw new AppError.BadQuery(
        `Insufficient stock for product '${product.name}'. Available quantity: ${product.stock}.`,
      );
    }

    // Decrease the stock and save the product
    product.stock -= quantity;

    return product.save();
  }
}
