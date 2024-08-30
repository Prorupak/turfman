import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  Model,
  Connection,
  ClientSession,
  Types,
  PipelineStage,
} from 'mongoose';
import {
  Product,
  ProductDocument,
} from 'modules/product/schemas/product.schema';
import { CategoryDocument } from 'modules/category/schemas/category.schema';
import { Cache } from 'cache-manager';
import { runInTransaction } from 'utils';
import { AppError } from 'common/errors';
import { OrderStatus } from './order-management.enum';
import {
  OrderManagementDocument,
  Order,
} from './schemas/order-management.schema';
import {
  DeliveryConfiguration,
  DeliveryConfigurationDocument,
} from 'modules/delivery-configuration/schema/delivery-configuration.schema';
import { CreateOrderDto } from './dto/create-order-management.dto';
import { UpdateOrderManagementDto } from './dto/update-order-management.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { User, UserDocument } from 'modules/users/schemas/users.schema';
import { REDIS_TTL } from 'constants/global';
import { orderSelectBase, ordersSelectDetails } from './constants';
import { userSelect } from 'modules/users/constants';
import { PaginationType, Periods, SingleOrderResponse } from '@turfman/types';
import { SearchOrdersDto } from './dto/query-orders.dto';
import {
  PaginationService,
  PopulateField,
} from 'helpers/pagination/pagination.service';
import { AggregationPipelines } from 'utils/aggregation-pipelines';
import {
  productSelectDetails,
  productSelectMinimal,
} from 'modules/product/constants';
import { CreateReturnDto } from './dto/create-return-product.dto';
import { DashboardService } from 'modules/dashboard/dashboard.service';

@Injectable()
export class OrderService {
  private readonly CACHE_KEY_PREFIX = 'orders';
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderManagementDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(DeliveryConfiguration.name)
    private deliveryConfigModel: Model<DeliveryConfigurationDocument>,
    @InjectConnection() private connection: Connection,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private paginationService: PaginationService,
    private dashboardService: DashboardService,
  ) {}

  /**
   * @description Calculates the delivery cost based on the delivery configuration and the items being ordered.
   * @param items - The items in the order
   * @param deliveryPostcode - The delivery postcode for the order
   * @param session - The current transaction session
   * @returns {Promise<number>} The calculated delivery cost
   * @throws {NotFoundException} If the delivery configuration for any category is not found
   */
  private async calculateDeliveryCost(
    items: CreateOrderDto['items'],
    deliveryPostcode: string,
    session: ClientSession,
  ): Promise<number> {
    let highestDeliveryRate = 0;

    for (const item of items) {
      const product = await this.productModel
        .findById(item.product)
        .session(session)
        .populate('category')
        .exec();
      const category = product.category as unknown as CategoryDocument;

      const deliveryConfig = await this.deliveryConfigModel
        .findOne({ category: category._id, isActive: true })
        .session(session)
        .exec();

      if (!deliveryConfig) {
        throw new NotFoundException(
          `Delivery configuration not found for category '${category.name}'.`,
        );
      }

      const applicableRate = this.getApplicableDeliveryRate(
        deliveryConfig,
        deliveryPostcode,
      );
      highestDeliveryRate = Math.max(highestDeliveryRate, applicableRate);
    }

    return highestDeliveryRate;
  }

  /**
   * @description Determines the applicable delivery rate based on the delivery configuration and postcode.
   * @param config - The delivery configuration for the category
   * @param postcode - The delivery postcode
   * @returns {number} The applicable delivery rate
   */
  private getApplicableDeliveryRate(
    config: DeliveryConfigurationDocument,
    postcode: string,
  ): number {
    if (config.flatRate) {
      if (config.applicablePostcodes.includes(postcode)) {
        return config.flatRate;
      }
      throw new BadRequestException(
        `Delivery is not available in the specified postcode: ${postcode}.`,
      );
    }

    if (config.regionSpecificRates) {
      return this.isLocalPostcode(postcode)
        ? config.regionSpecificRates.local
        : config.regionSpecificRates.national;
    }

    return 0;
  }

  /**
   * @description Checks if the given postcode is considered "local".
   * @param postcode - The postcode to check
   * @returns {boolean} True if the postcode is local, false otherwise
   */
  private isLocalPostcode(postcode: string): boolean {
    const localPostcodes = ['6000', '6001', '6002']; // Example local postcodes
    return localPostcodes.includes(postcode);
  }

  /**
   * @description Creates a new order while handling product stock reduction, delivery rate calculation, and reserved stock management.
   */
  async createOrder(
    userId: string,
    deliveryPostcode: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    return runInTransaction(this.connection, async (session: ClientSession) => {
      const { items, specialInstructions, deliveryDetails } = createOrderDto;

      const postcode =
        deliveryPostcode ?? createOrderDto?.deliveryDetails?.postalCode;

      let totalAmount = 0;

      // Prepare the items with their final prices
      const processedItems = await Promise.all(
        items.map(async (item) => {
          const product = await this.productModel
            .findById(item.product)
            .session(session)
            .exec();

          if (!product) {
            throw new AppError.NotFound(
              `Product with ID '${item.product}' not found.`,
            );
          }

          // Determine the variant and location-based price
          const variantDetails = product.variantDetails.find((variant) =>
            Object.entries(item.variantAttributes).every(
              ([key, value]) => variant.attributes.get(key) === value,
            ),
          );

          if (!variantDetails) {
            throw new AppError.NotFound(
              `Variant combination ${JSON.stringify(item.variantAttributes)} not found for product '${product.name}'.`,
            );
          }

          // Check if stock is available for the selected variant
          if (variantDetails.quantity < item.quantity) {
            throw new AppError.NotFound(
              `Insufficient stock for the selected variant of product '${product.name}'.`,
            );
          }

          // Reserve the stock for the selected variant
          variantDetails.quantity -= item.quantity;
          product.reservedStock += item.quantity;
          await product.save({ session });

          // Determine the price (consider location-based pricing)
          let finalPrice = variantDetails.price;
          if (
            product.pricingByLocation &&
            product.pricingByLocation.has(postcode)
          ) {
            finalPrice = product.pricingByLocation.get(postcode);
          }

          // Calculate item cost and update total cost
          totalAmount += finalPrice * item.quantity;

          // Return the processed item with price included
          return {
            product: new Types.ObjectId(item.product),
            quantity: item.quantity,
            variantAttributes: item.variantAttributes,
            price: finalPrice, // Include the calculated final price here
          };
        }),
      );

      // Calculate delivery cost
      const deliveryCost = await this.calculateDeliveryCost(
        items,
        postcode,
        session,
      );
      totalAmount += deliveryCost;

      // Create the order
      const newOrder = new this.orderModel({
        postcode,
        deliveryDetails,
        specialInstructions,
        deliveryCost,
        totalAmount,
        customer: new Types.ObjectId(userId),
        status: OrderStatus.PENDING,
        items: processedItems,
      });

      const createdOrder = await newOrder.save({ session });

      // Update user's postcode if available
      if (createOrderDto?.deliveryDetails?.postalCode) {
        await this.userModel.findByIdAndUpdate(
          new Types.ObjectId(userId),
          {
            postcode: createOrderDto?.deliveryDetails?.postalCode,
          },
          { session },
        );
      }

      // Invalidate cache
      await this.cacheManager.reset();

      return createdOrder;
    });
  }

  async updateOrder(
    orderId: string,
    updateOrderDto: UpdateOrderManagementDto,
  ): Promise<Order> {
    return runInTransaction(this.connection, async (session: ClientSession) => {
      const order = await this.orderModel
        .findById(orderId)
        .session(session)
        .exec();

      if (!order) {
        throw new AppError.NotFound(`Order with ID '${orderId}' not found.`);
      }

      let totalAmount = 0;

      // Process and validate the updated items
      const processedItems = await Promise.all(
        updateOrderDto.items.map(async (item) => {
          const product = await this.productModel
            .findById(item.product)
            .session(session)
            .exec();

          if (!product) {
            throw new AppError.NotFound(
              `Product with ID '${item.product}' not found.`,
            );
          }

          // Find the current item in the existing order for comparison
          const existingOrderItem = order.items.find(
            (orderItem) =>
              orderItem.product.toString() === item.product &&
              JSON.stringify(orderItem.variantAttributes) ===
                JSON.stringify(item.variantAttributes),
          );

          // Determine the variant and location-based price
          const variantDetails = product.variantDetails.find((variant) =>
            Object.entries(item.variantAttributes).every(
              ([key, value]) => variant.attributes.get(key) === value,
            ),
          );

          if (!variantDetails) {
            throw new AppError.NotFound(
              `Variant combination ${JSON.stringify(item.variantAttributes)} not found for product '${product.name}'.`,
            );
          }

          // Handle stock adjustments based on quantity changes
          const quantityDifference =
            item.quantity - (existingOrderItem?.quantity || 0);

          if (quantityDifference > 0) {
            // If the quantity is increasing, check stock availability
            if (variantDetails.quantity < quantityDifference) {
              throw new AppError.BadQuery(
                `Insufficient stock for the selected variant of product '${product.name}'.`,
              );
            }

            // Reserve additional stock
            variantDetails.quantity -= quantityDifference;
            product.reservedStock += quantityDifference;
          } else if (quantityDifference < 0) {
            // If the quantity is decreasing, release reserved stock
            variantDetails.quantity -= quantityDifference; // Note: quantityDifference is negative here
            product.reservedStock += quantityDifference;
          }

          await product.save({ session });

          // Determine the price (consider location-based pricing)
          let finalPrice = variantDetails.price;
          if (
            product.pricingByLocation &&
            product.pricingByLocation.has(order.deliveryDetails.postalCode)
          ) {
            finalPrice = product.pricingByLocation.get(
              order.deliveryDetails.postalCode,
            );
          }

          // Calculate item cost and update total cost
          totalAmount += finalPrice * item.quantity;

          // Return the processed item with price included
          return {
            product: new Types.ObjectId(item.product),
            quantity: item.quantity,
            variantAttributes: item.variantAttributes,
            price: finalPrice, // Include the updated final price
          };
        }),
      );

      // Recalculate delivery cost if any delivery details have changed
      const deliveryCost = updateOrderDto.deliveryDetails
        ? await this.calculateDeliveryCost(
            processedItems,
            updateOrderDto.deliveryDetails.postalCode,
            session,
          )
        : order.deliveryCost;

      totalAmount += deliveryCost;

      // Update the order with the new items, delivery details, and totals
      Object.assign(order, {
        items: processedItems,
        deliveryDetails:
          updateOrderDto.deliveryDetails || order.deliveryDetails,
        specialInstructions: updateOrderDto.specialInstructions,
        deliveryCost,
        totalAmount,
      });

      const updatedOrder = await order.save({ session });

      // Invalidate the order cache if needed
      await this.cacheManager.reset();

      return updatedOrder;
    });
  }

  async cancelOrder(orderId: string): Promise<void> {
    return runInTransaction(this.connection, async (session: ClientSession) => {
      const order = await this.orderModel
        .findById(orderId)
        .session(session)
        .exec();

      if (!order) {
        throw new AppError.NotFound(`Order with ID '${orderId}' not found.`);
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new AppError.BadQuery(`Only pending orders can be canceled.`);
      }

      // Release reserved stock for each item in the order
      for (const item of order.items) {
        const product = await this.productModel
          .findById(item.product)
          .session(session)
          .exec();
        if (!product) {
          throw new AppError.NotFound(
            `Product with ID '${item.product}' not found.`,
          );
        }

        const variantDetails = product.variantDetails.find((variant) =>
          Object.entries(item.variantAttributes).every(
            ([key, value]) => variant.attributes.get(key) === value,
          ),
        );

        if (!variantDetails) {
          throw new AppError.NotFound(
            `Variant combination ${JSON.stringify(item.variantAttributes)} not found for product '${product.name}'.`,
          );
        }

        // Release the reserved stock back to the available quantity
        variantDetails.quantity += item.quantity;
        product.reservedStock -= item.quantity;

        await product.save({ session });
      }

      // Update the order status to "Canceled"
      order.status = OrderStatus.CANCELED;
      await order.save({ session });

      // Invalidate relevant caches
      await this.cacheManager.reset();
    });
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order> {
    return runInTransaction(this.connection, async (session: ClientSession) => {
      const order = await this.orderModel
        .findById(orderId)
        .session(session)
        .exec();

      if (!order) {
        throw new AppError.NotFound(`Order with ID '${orderId}' not found.`);
      }

      if (order.status === status) {
        throw new AppError.BadQuery(`Order is already in '${status}' status.`);
      }

      // Defensive check: Ensure `items` is an array
      if (!Array.isArray(order.items)) {
        throw new AppError.Argument(`Order items are not properly defined.`);
      }

      // If the status is changing to "Completed", finalize the stock adjustments
      if (status === OrderStatus.COMPLETED) {
        for (const item of order.items) {
          const product = await this.productModel
            .findById(item.product)
            .session(session)
            .exec();
          if (!product) {
            throw new AppError.NotFound(
              `Product with ID '${item.product}' not found.`,
            );
          }

          // Convert item.variantAttributes to an object if it's a Map
          const itemAttributes =
            item.variantAttributes instanceof Map
              ? Object.fromEntries(item.variantAttributes)
              : item.variantAttributes;

          // Find the variant based on attributes
          const variantDetails = product.variantDetails.find((variant) =>
            Object.entries(itemAttributes).every(
              ([key, value]) => variant.attributes.get(key) === value,
            ),
          );

          if (!variantDetails) {
            throw new AppError.NotFound(
              `Variant combination ${JSON.stringify(item.variantAttributes)} not found for product '${product.name}'.`,
            );
          }

          // Finalize the reserved stock by reducing it and the available quantity
          product.reservedStock -= item.quantity;
          variantDetails.quantity -= item.quantity;

          product.updatedAt = new Date();

          await product.save({ session });
        }
      }

      // Update the order status
      order.status = status;

      const updatedOrder = await order.save({ session });

      // Invalidate relevant caches
      await this.cacheManager.reset();

      return updatedOrder;
    });
  }

  async createReturn(createReturnDto: CreateReturnDto): Promise<Order> {
    return runInTransaction(this.connection, async (session: ClientSession) => {
      const { orderId, items } = createReturnDto;

      const order = await this.orderModel
        .findById(orderId)
        .session(session)
        .exec();
      if (!order) {
        throw new NotFoundException(`Order with ID '${orderId}' not found.`);
      }

      // Update product quantities and track returns
      for (const item of items) {
        const product = await this.productModel
          .findById(item.productId)
          .session(session)
          .exec();
        if (!product) {
          throw new NotFoundException(
            `Product with ID '${item.productId}' not found.`,
          );
        }

        const orderItem = order.items.find(
          (orderItem) => orderItem.product.toString() === item.productId,
        );
        if (!orderItem || orderItem.quantity < item.quantity) {
          throw new NotFoundException(
            `Invalid return quantity for product with ID '${item.productId}'.`,
          );
        }

        // Update stock and reserved stock
        product.stock += item.quantity;
        product.reservedStock -= item.quantity;

        // Update return rate and reason
        product.returnCount = (product.returnCount || 0) + item.quantity;
        product.returnReasons = product.returnReasons || [];
        if (item.reason) {
          product.returnReasons.push(item.reason);
        }

        await product.save({ session });
      }

      // Update the order status to include the return
      order.status = OrderStatus.RETURNED;
      order.returnItems = items.map((item) => ({
        productId: new Types.ObjectId(item.productId),
        quantity: item.quantity,
        reason: item.reason,
        attributes: new Map(Object.entries(item.attributes)),
      }));

      const updatedOrder = await order.save({ session });

      // Update financial metrics
      await this.dashboardService.updateFinancialMetrics(session);

      return updatedOrder;
    });
  }

  /**
   * Retrieves a single order by ID from the database or cache.
   * @param {string} orderId - The ID of the order to retrieve.
   * @returns {Promise<Order>} The order document.
   * @throws {NotFoundException} If the order is not found.
   */
  async getSingleOrder(orderId: string): Promise<SingleOrderResponse> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${orderId}`;

    return this.cacheManager.wrap<SingleOrderResponse>(
      cacheKey,
      async () => {
        const order = await this.orderModel
          .findById(orderId)
          .select(ordersSelectDetails)
          .populate({ path: 'customer', select: userSelect })
          .populate({ path: 'items.product', select: productSelectDetails })
          .lean()
          .exec();
        if (!order) {
          throw new NotFoundException(`Order with ID '${orderId}' not found.`);
        }
        return order as unknown as SingleOrderResponse;
      },
      REDIS_TTL,
    );
  }

  /**
   * Retrieves all orders with optional filters, sorting, and search.
   * @param {SearchOrdersDto} filters - The filters, sorting, and search criteria to apply.
   * @returns {Promise<AllOrdersPaginatedResponse>} A list of orders.
   */
  async getAllOrders(filters: SearchOrdersDto) {
    const {
      skip = 0,
      take = 10,
      status,
      userId,
      sort: sortOption,
      dateRange,
    } = filters;

    const cacheKey = `${this.CACHE_KEY_PREFIX}:all:${JSON.stringify(filters)}`;

    // Try retrieving orders from the cache
    return this.cacheManager.wrap(
      cacheKey,
      async () => {
        const query: any = {};

        // Apply optional filters
        if (status) {
          query.status = status;
        }
        if (userId) {
          query.user = userId;
        }
        if (dateRange?.from || dateRange?.to) {
          query.createdAt = {};
          if (dateRange.from) query.createdAt.$gte = new Date(dateRange.from);
          if (dateRange.to) query.createdAt.$lte = new Date(dateRange.to);
        }

        // Apply full-text search
        // if (search) {
        //   query.$text = { $search: search }; // Requires a text index on the relevant fields
        // }

        // Set pagination options
        const pagination: PaginationType = { page: skip, perPage: take };
        const sortOptions = {
          [sortOption.field]: sortOption.order,
        };

        const populatedField: PopulateField[] = [
          {
            from: 'users',
            localField: 'customer',
            unwind: true,
            project: userSelect,
          },
        ];

        return await this.paginationService.getPaginatedQueryResponse(
          this.orderModel,
          query,
          pagination,
          populatedField,
          orderSelectBase,
          sortOptions,
        );
      },
      REDIS_TTL,
    );
  }

  /**
   * Retrieves the volume of orders by their statuses.
   * @returns {Promise<{ placed: number; fulfilled: number; pending: number }>} An object containing the count of orders placed, fulfilled, and pending.
   */
  async getOrderVolume(): Promise<{
    placed: number;
    fulfilled: number;
    pending: number;
  }> {
    const [placed, fulfilled, pending] = await Promise.all([
      this.orderModel.countDocuments().exec(), // Total orders placed
      this.orderModel.countDocuments({ status: OrderStatus.COMPLETED }).exec(), // Orders fulfilled
      this.orderModel.countDocuments({ status: OrderStatus.PENDING }).exec(), // Orders pending
    ]);

    return { placed, fulfilled, pending };
  }

  /**
   * Calculates the average time taken to fulfill orders.
   * @returns {Promise<number>} The average fulfillment time in milliseconds.
   */
  async getAverageFulfillmentTime(): Promise<number> {
    const basePipeline = AggregationPipelines.getPipelineForGetByIdOrdered();

    // Add necessary stages to the pipeline
    basePipeline.unshift({
      $match: { status: OrderStatus.COMPLETED },
    });

    basePipeline.push({
      $project: {
        fulfillmentTime: {
          $subtract: [{ $toLong: '$updatedAt' }, { $toLong: '$createdAt' }],
        },
      },
    });

    basePipeline.push({
      $group: {
        _id: null,
        averageFulfillmentTime: { $avg: '$fulfillmentTime' }, // Calculate the average
      },
    });

    const fulfilledOrders = await this.orderModel
      .aggregate(basePipeline)
      .exec();
    console.log(fulfilledOrders);

    return fulfilledOrders.length > 0
      ? fulfilledOrders[0].averageFulfillmentTime
      : 0;
  }

  /**
   * Retrieves orders that are currently in transit.
   */
  async getOrdersInTransit(): Promise<Order[]> {
    const pipeline = AggregationPipelines.getPipelineForGetByIdOrdered();

    pipeline.unshift({
      $match: {
        status: { $in: [OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED] },
      },
    });

    pipeline.push({
      $project: ordersSelectDetails,
    });

    const ordersInTransit = await this.orderModel.aggregate(pipeline).exec();
    return ordersInTransit;
  }

  /**
   * Retrieves total sales statistics grouped by different time periods.
   * @param {string} period - The period for grouping (e.g., 'daily', 'weekly', 'monthly').
   * @returns {Promise<any>} Sales statistics for the specified period.
   */
  async getTotalSalesStatistics(period: Periods): Promise<any> {
    const matchStage: PipelineStage = {
      $match: { status: OrderStatus.COMPLETED },
    };

    const groupStage: PipelineStage = {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
      },
    };

    switch (period) {
      case Periods.DAILY:
        groupStage.$group._id = {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        };
        break;
      case Periods.WEEKLY:
        groupStage.$group._id = { $isoWeek: '$createdAt' };
        break;
      case Periods.MONTHLY:
        groupStage.$group._id = {
          $dateToString: { format: '%Y-%m', date: '$createdAt' },
        };
        break;
      case Periods.QUARTERLY:
        groupStage.$group._id = {
          $concat: [
            { $toString: { $year: '$createdAt' } },
            '-',
            {
              $toString: { $ceil: { $divide: [{ $month: '$createdAt' }, 3] } },
            },
          ],
        };
        break;
      case Periods.YEARLY:
        groupStage.$group._id = { $year: '$createdAt' };
        break;
    }

    const projectStage: PipelineStage = {
      $project: {
        _id: 0,
        totalSales: 1,
        totalOrders: 1,
      },
    };

    const pipeline = [matchStage, groupStage, projectStage];
    const result = await this.orderModel.aggregate(pipeline).exec();
    return result;
  }

  /**
   * Retrieves the best-selling products by units sold and revenue.
   * @param {number} take - The number of top products to return.
   * @returns {Promise<any>} A list of best-selling products with total units sold and revenue.
   */
  async getBestSellingProducts(take: number): Promise<any> {
    const salesPipeline: PipelineStage[] = [
      { $match: { status: OrderStatus.COMPLETED } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
          pipeline: [{ $project: productSelectMinimal }],
        },
      },
      { $unwind: '$product' },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          product: { $first: '$product' },
          totalUnitsSold: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
        },
      },
      { $unset: '_id' },
      { $sort: { totalRevenue: -1 } },
      { $limit: take },
    ];

    const bestSellingProducts = await this.orderModel
      .aggregate(salesPipeline)
      .exec();
    return bestSellingProducts;
  }

  /**
   * Retrieves sales data for all products.
   * @returns {Promise<any>} A list of products with their total sales data.
   */
  async getProductSalesData(pagination: SearchOrdersDto): Promise<any> {
    const { sort, skip, take } = pagination;

    const matchStage = {
      status: OrderStatus.COMPLETED,
    };

    // Set pagination options
    const paginationOptions: PaginationType = { page: skip, perPage: take };
    const sortOptions = {
      [sort.field]: sort.order,
    };

    const remainingPipelineStages: PipelineStage[] = [
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: '$items.product',
          product: { $first: '$productDetails' },
          totalUnitsSold: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
        },
      },
      {
        $unset: '_id',
      },
    ];

    // Fetch the paginated data using the aggregation pipeline
    const productSalesData =
      await this.paginationService.getPaginatedQueryResponse(
        this.orderModel,
        matchStage,
        paginationOptions,
        [],
        {
          product: 1,
          totalUnitsSold: 1,
          totalRevenue: 1,
        },
        sortOptions,
        remainingPipelineStages,
      );

    return productSalesData;
  }

  /**
   * Calculates the return rate and reasons for each product.
   * @returns {Promise<any>} A list of products with return rates and reasons.
   */
  async getProductReturnsData(): Promise<any> {
    const returnPipeline: PipelineStage[] = [
      { $match: { status: OrderStatus.RETURNED } },
      {
        $lookup: {
          from: 'products',
          localField: 'returnItems.productId',
          foreignField: '_id',
          as: 'products',
          pipeline: [{ $project: productSelectMinimal }],
        },
      },
      { $unwind: '$products' },
      { $unwind: '$returnItems' },
      {
        $group: {
          _id: '$returnItems.productId',
          product: { $first: '$products' },
          totalReturns: { $sum: '$returnItems.quantity' },
          reasons: { $push: '$returnItems.reason' },
        },
      },
      { $unset: '_id' },
    ];

    const pipeline = [...returnPipeline];
    const productReturnsData = await this.orderModel.aggregate(pipeline).exec();
    return productReturnsData;
  }
}
