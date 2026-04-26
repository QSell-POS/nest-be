import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale, SaleStatus } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale.entity';
import { Purchase } from '../purchases/entities/purchase.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductPrice } from '../products/entities/product-price.entity';
import { IncomeExpense, TransactionType } from '../income-expense/entities/income-expense.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductPrice)
    private priceRepository: Repository<ProductPrice>,
    @InjectRepository(IncomeExpense)
    private incomeExpenseRepository: Repository<IncomeExpense>,
    private dataSource: DataSource,
  ) {}

  // ── Dashboard Overview ────────────────────────────────────
  async getDashboardStats(shopId: string) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [todaySales, monthSales, lastMonthSales, totalProducts, lowStockCount, pendingPurchases] = await Promise.all([
      this.saleRepository
        .createQueryBuilder('s')
        .select('COALESCE(SUM(s.grandTotal),0)', 'total')
        .addSelect('COUNT(*)', 'count')
        .where('s.shopId = :shopId AND s.saleDate BETWEEN :start AND :end AND s.status != :cancelled', {
          shopId,
          start: startOfDay,
          end: endOfDay,
          cancelled: SaleStatus.CANCELLED,
        })
        .getRawOne(),

      this.saleRepository
        .createQueryBuilder('s')
        .select('COALESCE(SUM(s.grandTotal),0)', 'total')
        .addSelect('COALESCE(SUM(s.profit),0)', 'profit')
        .addSelect('COUNT(*)', 'count')
        .where('s.shopId = :shopId AND s.saleDate >= :start AND s.status != :cancelled', {
          shopId,
          start: startOfMonth,
          cancelled: SaleStatus.CANCELLED,
        })
        .getRawOne(),

      this.saleRepository
        .createQueryBuilder('s')
        .select('COALESCE(SUM(s.grandTotal),0)', 'total')
        .addSelect('COALESCE(SUM(s.profit),0)', 'profit')
        .where('s.shopId = :shopId AND s.saleDate BETWEEN :start AND :end AND s.status != :cancelled', {
          shopId,
          start: startOfLastMonth,
          end: endOfLastMonth,
          cancelled: SaleStatus.CANCELLED,
        })
        .getRawOne(),

      this.productRepository.count({ where: { shopId } }),

      this.inventoryRepository
        .createQueryBuilder('inv')
        .innerJoin('inv.product', 'p')
        .where('inv.shopId = :shopId AND inv.quantityAvailable <= p.minStockLevel AND p.trackInventory = true', { shopId })
        .getCount(),

      this.purchaseRepository.count({
        where: { shopId, status: 'ordered' as any },
      }),
    ]);

    const salesGrowth =
      Number(lastMonthSales.total) > 0
        ? ((Number(monthSales.total) - Number(lastMonthSales.total)) / Number(lastMonthSales.total)) * 100
        : 0;
    const profitGrowth =
      Number(lastMonthSales.profit) > 0
        ? ((Number(monthSales.profit) - Number(lastMonthSales.profit)) / Number(lastMonthSales.profit)) * 100
        : 0;

    return {
      today: {
        sales: Number(todaySales.total),
        transactions: Number(todaySales.count),
      },
      thisMonth: {
        sales: Number(monthSales.total),
        profit: Number(monthSales.profit),
        transactions: Number(monthSales.count),
        salesGrowth: Math.round(salesGrowth * 100) / 100,
        profitGrowth: Math.round(profitGrowth * 100) / 100,
      },
      inventory: { totalProducts, lowStockCount },
      pendingPurchases,
    };
  }

  // ── Sales Chart (daily/weekly/monthly) ───────────────────
  async getSalesChart(shopId: string, period: 'daily' | 'weekly' | 'monthly', startDate: string, endDate: string) {
    const truncate = period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month';

    const rows = await this.saleRepository
      .createQueryBuilder('s')
      .select(`DATE_TRUNC('${truncate}', s.saleDate)`, 'period')
      .addSelect('COALESCE(SUM(s.grandTotal),0)', 'revenue')
      .addSelect('COALESCE(SUM(s.profit),0)', 'profit')
      .addSelect('COUNT(*)', 'transactions')
      .where('s.shopId = :shopId AND s.saleDate BETWEEN :startDate AND :endDate AND s.status != :cancelled', {
        shopId,
        startDate,
        endDate,
        cancelled: SaleStatus.CANCELLED,
      })
      .groupBy(`DATE_TRUNC('${truncate}', s.saleDate)`)
      .orderBy('period', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      period: r.period,
      revenue: Number(r.revenue),
      profit: Number(r.profit),
      transactions: Number(r.transactions),
    }));
  }

  // ── Price Fluctuation Chart ───────────────────────────────
  async getPriceFluctuationChart(productId: string, shopId: string) {
    const history = await this.priceRepository
      .createQueryBuilder('pp')
      .select(['pp.priceType', 'pp.price', 'pp.costPrice', 'pp.effectiveFrom', 'pp.reason'])
      .where('pp.productId = :productId AND pp.shopId = :shopId', {
        productId,
        shopId,
      })
      .orderBy('pp.effectiveFrom', 'ASC')
      .getMany();

    // Group by price type
    const grouped: Record<string, any[]> = {};
    for (const h of history) {
      if (!grouped[h.priceType]) grouped[h.priceType] = [];
      grouped[h.priceType].push({
        date: h.effectiveFrom,
        price: Number(h.price),
        costPrice: h.costPrice ? Number(h.costPrice) : null,
        reason: h.reason,
      });
    }
    return grouped;
  }

  // ── Most Selling Products (MVP) ───────────────────────────
  async getMostSellingProducts(shopId: string, limit = 10, startDate?: string, endDate?: string) {
    const qb = this.saleItemRepository
      .createQueryBuilder('si')
      .innerJoin('si.sale', 's', 's.shopId = :shopId AND s.status != :cancelled', {
        shopId,
        cancelled: SaleStatus.CANCELLED,
      })
      .leftJoin('si.product', 'p')
      .leftJoin('p.brand', 'brand')
      .leftJoin('p.category', 'category')
      .leftJoin('p.unit', 'unit')

      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('p.sku', 'sku')
      .addSelect('brand.name', 'brandName')
      .addSelect('category.name', 'categoryName')
      .addSelect('unit.symbol', 'unitSymbol')

      .addSelect('SUM(si.quantity)', 'totalQuantity')
      .addSelect('SUM(si.subtotal)', 'totalRevenue')
      .addSelect('SUM(si.profit)', 'totalProfit')
      .addSelect('COUNT(DISTINCT s.id)', 'orderCount')

      .groupBy('p.id')
      .addGroupBy('brand.id')
      .addGroupBy('category.id')
      .addGroupBy('unit.id')

      .orderBy('SUM(si.quantity)', 'DESC')
      .limit(limit);

    if (startDate) qb.andWhere('s.saleDate >= :startDate', { startDate });
    if (endDate) qb.andWhere('s.saleDate <= :endDate', { endDate });

    const rows = await qb.getRawMany();

    return {
      data: rows.map((row) => ({
        productId: row.productId,
        name: row.productName,
        sku: row.sku,
        brandName: row.brandName,
        categoryName: row.categoryName,
        unitSymbol: row.unitSymbol,
        totalQuantity: Number(row.totalQuantity),
        totalRevenue: Number(row.totalRevenue),
        totalProfit: Number(row.totalProfit),
        orderCount: Number(row.orderCount),
      })),
    };
  }

  // ── Least Selling / Slow-Moving Products ─────────────────
  async getSlowMovingProducts(shopId: string, days = 30, limit = 10) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.inventoryRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'product')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('inv.shopId = :shopId', { shopId })
      .andWhere('(inv.lastSoldAt IS NULL OR inv.lastSoldAt < :cutoff)', { cutoff })
      .andWhere('inv.quantityOnHand > 0')
      .orderBy('inv.lastSoldAt', 'ASC', 'NULLS FIRST')
      .limit(limit)
      .getMany();
  }

  // ── Sales Prediction (Linear Regression) ─────────────────
  async getSalesPrediction(shopId: string, futureDays = 7) {
    // Fetch last 90 days of daily sales
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const historicalData = await this.saleRepository
      .createQueryBuilder('s')
      .select("DATE_TRUNC('day', s.saleDate)", 'day')
      .addSelect('COALESCE(SUM(s.grandTotal),0)', 'revenue')
      .where("s.shopId = :shopId AND s.saleDate >= :since AND s.status != 'cancelled'", {
        shopId,
        since,
      })
      .groupBy("DATE_TRUNC('day', s.saleDate)")
      .orderBy('day', 'ASC')
      .getRawMany();

    if (historicalData.length < 7) {
      return { message: 'Insufficient data for prediction', predictions: [] };
    }

    // Simple linear regression
    const n = historicalData.length;
    const xValues = historicalData.map((_, i) => i);
    const yValues = historicalData.map((d) => Number(d.revenue));

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
    const sumXX = xValues.reduce((acc, x) => acc + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Weekly seasonality — calculate average multiplier per day of week
    const dowMap: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    const avgRevenue = sumY / n;
    historicalData.forEach((d) => {
      const dow = new Date(d.day).getDay();
      dowMap[dow].push(Number(d.revenue));
    });
    const dowMultiplier: Record<number, number> = {};
    for (const dow in dowMap) {
      const vals = dowMap[dow];
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : avgRevenue;
      dowMultiplier[dow] = avgRevenue > 0 ? avg / avgRevenue : 1;
    }

    const predictions = [];
    const lastDate = new Date(historicalData[historicalData.length - 1].day);
    for (let i = 1; i <= futureDays; i++) {
      const date = new Date(lastDate);
      date.setDate(date.getDate() + i);
      const x = n - 1 + i;
      const trendRevenue = slope * x + intercept;
      const seasonalMultiplier = dowMultiplier[date.getDay()] ?? 1;
      predictions.push({
        date: date.toISOString().split('T')[0],
        predictedRevenue: Math.max(0, Math.round(trendRevenue * seasonalMultiplier * 100) / 100),
        trend: Math.round(trendRevenue * 100) / 100,
      });
    }

    return {
      historicalAverage: Math.round((sumY / n) * 100) / 100,
      trend: slope > 0 ? 'upward' : slope < 0 ? 'downward' : 'flat',
      trendStrength: Math.abs(slope),
      predictions,
    };
  }

  // ── Profit & Loss Report ──────────────────────────────────
  async getProfitLossReport(shopId: string, startDate: string, endDate: string) {
    const [salesData, incomeExpenseData, purchaseData] = await Promise.all([
      this.saleRepository
        .createQueryBuilder('s')
        .select('COALESCE(SUM(s.grandTotal),0)', 'totalRevenue')
        .addSelect('COALESCE(SUM(s.profit),0)', 'grossProfit')
        .addSelect('COALESCE(SUM(s.taxAmount),0)', 'totalTax')
        .addSelect('COALESCE(SUM(s.discountAmount),0)', 'totalDiscount')
        .addSelect('COUNT(*)', 'saleCount')
        .where("s.shopId = :shopId AND s.saleDate BETWEEN :startDate AND :endDate AND s.status != 'cancelled'", {
          shopId,
          startDate,
          endDate,
        })
        .getRawOne(),

      this.incomeExpenseRepository
        .createQueryBuilder('ie')
        .select('ie.transactionType', 'type')
        .addSelect('ie.category', 'category')
        .addSelect('COALESCE(SUM(ie.amount),0)', 'total')
        .where('ie.shopId = :shopId AND ie.transactionDate BETWEEN :startDate AND :endDate', {
          shopId,
          startDate,
          endDate,
        })
        .groupBy('ie.transactionType, ie.category')
        .getRawMany(),

      this.purchaseRepository
        .createQueryBuilder('p')
        .select('COALESCE(SUM(p.grandTotal),0)', 'totalPurchases')
        .where("p.shopId = :shopId AND p.purchaseDate BETWEEN :startDate AND :endDate AND p.status = 'received'", {
          shopId,
          startDate,
          endDate,
        })
        .getRawOne(),
    ]);

    const totalRevenue = Number(salesData.totalRevenue);
    const grossProfit = Number(salesData.grossProfit);
    const totalPurchases = Number(purchaseData.totalPurchases);

    const expenses = incomeExpenseData
      .filter((r) => r.type === TransactionType.EXPENSE)
      .reduce(
        (acc, r) => {
          acc[r.category] = Number(r.total);
          return acc;
        },
        {} as Record<string, number>,
      );

    const totalOperatingExpenses = Number(Object.values(expenses).reduce((a: any, b: any) => a + b, 0));
    const netProfit = grossProfit - totalOperatingExpenses;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      period: { startDate, endDate },
      revenue: {
        totalRevenue,
        totalDiscount: Number(salesData.totalDiscount),
        totalTax: Number(salesData.totalTax),
        saleCount: Number(salesData.saleCount),
      },
      costOfGoodsSold: totalPurchases,
      grossProfit,
      grossMargin: Math.round(grossMargin * 100) / 100,
      operatingExpenses: expenses,
      totalOperatingExpenses,
      netProfit,
      netMargin: Math.round(netMargin * 100) / 100,
    };
  }

  // ── Category Performance ──────────────────────────────────
  async getCategoryPerformance(shopId: string, startDate: string, endDate: string) {
    const data = await this.saleItemRepository
      .createQueryBuilder('si')
      .innerJoin('si.sale', 's', "s.shopId = :shopId AND s.saleDate BETWEEN :startDate AND :endDate AND s.status != 'cancelled'", {
        shopId,
        startDate,
        endDate,
      })
      .innerJoin(Product, 'p', 'p.id = si.productId')
      .innerJoin('p.category', 'cat')
      .select('cat.id', 'categoryId')
      .addSelect('cat.name', 'categoryName')
      .addSelect('SUM(si.quantity)', 'totalQuantity')
      .addSelect('SUM(si.subtotal)', 'totalRevenue')
      .addSelect('SUM(si.profit)', 'totalProfit')
      .addSelect('COUNT(DISTINCT s.id)', 'orderCount')
      .groupBy('cat.id, cat.name')
      .orderBy('SUM(si.subtotal)', 'DESC')
      .getRawMany();

    return { data };
  }

  // ── Stock Valuation ───────────────────────────────────────
  async getStockValuation(shopId: string) {
    const rows = await this.inventoryRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('inv.shopId = :shopId AND inv.quantityOnHand > 0', { shopId })
      .getMany();

    let totalValue = 0;
    const items = rows.map((inv) => {
      const value = Number(inv.quantityOnHand) * Number(inv.averageCost);
      totalValue += value;
      return {
        product: inv.product,
        quantityOnHand: inv.quantityOnHand,
        averageCost: inv.averageCost,
        totalValue: Math.round(value * 100) / 100,
      };
    });

    return {
      items: items.sort((a, b) => b.totalValue - a.totalValue),
      totalStockValue: Math.round(totalValue * 100) / 100,
      totalProducts: items.length,
    };
  }

  // ── Customer Insights ─────────────────────────────────────
  async getTopCustomers(shopId: string, limit = 10, startDate?: string, endDate?: string) {
    const qb = this.saleRepository
      .createQueryBuilder('s')
      .innerJoin('s.customer', 'c')
      .select('c.id', 'customerId')
      .addSelect('c.name', 'customerName')
      .addSelect('c.phone', 'phone')
      .addSelect('SUM(s.grandTotal)', 'totalSpent')
      .addSelect('SUM(s.profit)', 'totalProfit')
      .addSelect('COUNT(*)', 'orderCount')
      .addSelect('AVG(s.grandTotal)', 'avgOrderValue')
      .where("s.shopId = :shopId AND s.status != 'cancelled' AND s.customerId IS NOT NULL", { shopId })
      .groupBy('c.id, c.name, c.phone')
      .orderBy('"totalSpent"', 'DESC')
      .limit(limit);

    if (startDate) qb.andWhere('s.saleDate >= :startDate', { startDate });
    if (endDate) qb.andWhere('s.saleDate <= :endDate', { endDate });

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      ...r,
      totalSpent: Number(r.totalSpent),
      totalProfit: Number(r.totalProfit),
      orderCount: Number(r.orderCount),
      avgOrderValue: Math.round(Number(r.avgOrderValue) * 100) / 100,
    }));
  }
}
