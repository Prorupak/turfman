import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Order,
  OrderManagementDocument,
} from 'modules/order-management/schemas/order-management.schema';
import {
  Product,
  ProductDocument,
} from 'modules/product/schemas/product.schema';
import { ClientSession, Model, PipelineStage } from 'mongoose';
import {
  DashboardMetrics,
  DashboardMetricsDocument,
} from './schema/dashboard-metrics.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class DashboardService {
  private readonly CACHE_KEY = 'metrics:return';

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderManagementDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(DashboardMetrics.name)
    private dashboardMetricsModel: Model<DashboardMetricsDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async updateFinancialMetrics(session: ClientSession): Promise<void> {
    // Step 1: Fetch all orders with returns
    const ordersWithReturns = await this.orderModel
      .find({ 'returnItems.0': { $exists: true } })
      .populate('returnItems.productId')
      .session(session)
      .exec();

    // Initialize metrics
    let totalReturns = 0;
    const returnReasonsMap: Record<string, number> = {};
    let totalRevenueImpact = 0;

    // Step 2: Calculate metrics
    for (const order of ordersWithReturns) {
      for (const returnItem of order.returnItems) {
        const product = await this.productModel
          .findById(returnItem.productId)
          .session(session)
          .exec();

        if (!product) continue;

        // Increment total returns
        totalReturns += returnItem.quantity;

        // Calculate revenue impact (assume return refunds the full price of the item)
        const itemPrice = product.variantDetails.find((variant) =>
          Object.entries(returnItem.attributes).every(
            ([key, value]) => variant.attributes.get(key) === value,
          ),
        )?.price;

        if (itemPrice) {
          totalRevenueImpact += itemPrice * returnItem.quantity;
        }

        // Track reasons for returns
        const reason = returnItem.reason || 'Unknown';
        returnReasonsMap[reason] =
          (returnReasonsMap[reason] || 0) + returnItem.quantity;

        // Update product's return count
        product.returnCount += returnItem.quantity;
        await product.save({ session });
      }
    }

    // Step 3: Calculate the rate of returns
    const totalOrders = await this.orderModel.countDocuments().exec();
    const returnRate = totalOrders ? (totalReturns / totalOrders) * 100 : 0;

    // Step 4: Save metrics to dashboard or related collection
    await this.dashboardMetricsModel.updateOne(
      {},
      {
        $set: {
          totalReturns,
          returnRate,
          totalRevenueImpact,
          returnReasons: returnReasonsMap,
          updatedAt: new Date(),
        },
      },
      { upsert: true, session },
    );
  }

  /**
   * Fetches metrics related to product returns.
   * @returns Returns rate, reasons, and revenue impact metrics.
   */
  async getReturnMetrics(): Promise<any> {
    const cacheKey = `${this.CACHE_KEY}`;
    return this.cacheManager.wrap(
      cacheKey,
      async () => {
        const pipeline: PipelineStage[] = [
          { $match: { 'returnItems.0': { $exists: true } } },
          {
            $unwind: '$returnItems',
          },
          {
            $lookup: {
              from: 'products',
              localField: 'returnItems.productId',
              foreignField: '_id',
              as: 'product',
            },
          },
          { $unwind: '$product' },
          {
            $group: {
              _id: '$returnItems.reason',
              totalReturns: { $sum: '$returnItems.quantity' },
              totalRevenueImpact: {
                $sum: {
                  $multiply: ['$returnItems.quantity', '$product.price'],
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              reasons: {
                $push: { reason: '$_id', count: '$totalReturns' },
              },
              totalReturns: { $sum: '$totalReturns' },
              totalRevenueImpact: { $sum: '$totalRevenueImpact' },
            },
          },
        ];

        const result = await this.orderModel.aggregate(pipeline).exec();

        if (!result.length) {
          return {
            reasons: [],
            totalReturns: 0,
            totalRevenueImpact: 0,
            returnRate: 0,
          };
        }

        const totalOrders = await this.orderModel.countDocuments();
        const returnRate = totalOrders
          ? (result[0].totalReturns / totalOrders) * 100
          : 0;

        return {
          reasons: result[0].reasons,
          totalReturns: result[0].totalReturns,
          totalRevenueImpact: result[0].totalRevenueImpact,
          returnRate,
        };
      },
      5 * 60 * 60,
    );
  }
}
