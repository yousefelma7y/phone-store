import connectDB from "../../../lib/mongodb";
import Order from "../../../models/Order";
import Product from "../../../models/Product";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { reportType, startDate, endDate, userId } = await request.json();

    if (!reportType) {
      return NextResponse.json(
        { success: false, message: "Report type is required" },
        { status: 400 }
      );
    }

    // Default to last 30 days if no dates provided
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    let reportData = {};

    switch (reportType) {
      case "sales":
        reportData = await generateSalesReport(start, end, userId);
        break;
      case "products":
        reportData = await generateProductReport(start, end, userId);
        break;
      case "daily":
        reportData = await generateDailyReport(start, end, userId);
        break;
      case "payment":
        reportData = await generatePaymentReport(start, end, userId);
        break;
      case "summary":
        reportData = await generateSummaryReport(start, end, userId);
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Invalid report type" },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        data: reportData,
        period: { start, end },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}

// Sales Report - Overall sales statistics
async function generateSalesReport(startDate, endDate, userId) {
  const matchQuery = {
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $ne: 'cancelled' } // Exclude cancelled orders
  };
  if (userId) matchQuery.userId = userId;

  const orders = await Order.find(matchQuery);

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Calculate totals by payment method
  const paymentBreakdown = orders.reduce((acc, order) => {
    const method = order.paymentMethod || "cash";
    acc[method] = (acc[method] || 0) + order.total;
    return acc;
  }, {});

  // Calculate discount totals
  const totalDiscount = orders.reduce(
    (sum, order) => sum + (order.discount?.amount || order.discount || 0),
    0
  );

  // Daily sales trend
  const dailySales = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = { date, sales: 0, orders: 0 };
    }
    acc[date].sales += order.total;
    acc[date].orders += 1;
    return acc;
  }, {});

  return {
    totalSales: totalSales,
    totalOrders,
    averageOrderValue: averageOrderValue,
    totalDiscount: totalDiscount,
    paymentBreakdown,
    dailySales: Object.values(dailySales).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    ),
  };
}

// Product Report - Best selling products
async function generateProductReport(startDate, endDate, userId) {
  const matchQuery = {
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $ne: 'cancelled' } // Exclude cancelled orders
  };
  if (userId) matchQuery.userId = userId;

  const orders = await Order.find(matchQuery).populate('items.product');

  // Calculate product statistics
  const productStats = {};

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const productId = (item.product?._id || item.product || item.productId).toString();
      const productName = item.product?.name || item.name || 'Unknown Product';

      if (!productStats[productId]) {
        productStats[productId] = {
          productId,
          name: productName,
          quantitySold: 0,
          revenue: 0,
          timesOrdered: 0,
        };
      }
      productStats[productId].quantitySold += item.quantity;
      productStats[productId].revenue += item.price * item.quantity;
      productStats[productId].timesOrdered += 1;
    });
  });

  // Convert to array and sort by revenue
  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20)
    .map(product => ({
      ...product,
      revenue: parseFloat(product.revenue)
    }));

  // Get low stock products
  const allProducts = await Product.find(userId ? { userId } : {});
  const lowStockProducts = allProducts
    .filter((p) => p.stock < (p.minStock || 10))
    .map((p) => ({
      _id: p._id,
      name: p.name,
      stock: p.stock,
      minStock: p.minStock || 10,
    }))
    .sort((a, b) => a.stock - b.stock);

  return {
    topProducts,
    lowStockProducts,
    totalProductsSold: Object.keys(productStats).length,
  };
}

// Daily Report - Sales by day
async function generateDailyReport(startDate, endDate, userId) {
  const matchQuery = {
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $ne: 'cancelled' } // Exclude cancelled orders
  };
  if (userId) matchQuery.userId = userId;

  const orders = await Order.find(matchQuery);

  const dailyData = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        totalSales: 0,
        totalOrders: 0,
        totalItems: 0,
        cash: 0,
        card: 0,
        discount: 0,
      };
    }
    acc[date].totalSales += order.total;
    acc[date].totalOrders += 1;
    acc[date].totalItems += order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    acc[date].discount += order.discount?.amount || order.discount || 0;

    if (order.paymentMethod === "cash") {
      acc[date].cash += order.total;
    } else if (order.paymentMethod === "card") {
      acc[date].card += order.total;
    }

    return acc;
  }, {});

  return {
    dailyReport: Object.values(dailyData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(day => ({
        ...day,
        totalSales: parseFloat(day.totalSales),
        cash: parseFloat(day.cash),
        card: parseFloat(day.card),
        discount: parseFloat(day.discount)
      })),
  };
}

// Payment Report - Payment method breakdown
async function generatePaymentReport(startDate, endDate, userId) {
  const matchQuery = {
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $ne: 'cancelled' } // Exclude cancelled orders
  };
  if (userId) matchQuery.userId = userId;

  const orders = await Order.find(matchQuery);

  const paymentStats = orders.reduce((acc, order) => {
    const method = order.paymentMethod || "cash";
    if (!acc[method]) {
      acc[method] = {
        method,
        totalAmount: 0,
        transactionCount: 0,
        averageTransaction: 0,
      };
    }
    acc[method].totalAmount += order.total;
    acc[method].transactionCount += 1;
    return acc;
  }, {});

  // Calculate averages
  Object.values(paymentStats).forEach(stat => {
    stat.averageTransaction = stat.totalAmount / stat.transactionCount;
    stat.totalAmount = parseFloat(stat.totalAmount);
    stat.averageTransaction = parseFloat(stat.averageTransaction);
  });

  return {
    paymentMethods: Object.values(paymentStats),
    totalTransactions: orders.length,
    totalRevenue: parseFloat(orders.reduce((sum, order) => sum + order.total, 0)),
  };
}

// Summary Report - Quick overview
async function generateSummaryReport(startDate, endDate, userId) {
  const matchQuery = {
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $ne: 'cancelled' } // Exclude cancelled orders
  };
  if (userId) matchQuery.userId = userId;

  const orders = await Order.find(matchQuery);
  const products = await Product.find(userId ? { userId } : {});

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalItemsSold = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
  const totalProducts = products.length;
  const lowStockCount = products.filter(
    (p) => p.stock < (p.minStock || 10)
  ).length;

  // Get cancelled orders count for reference
  const cancelledMatchQuery = {
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'cancelled'
  };
  if (userId) cancelledMatchQuery.userId = userId;
  const cancelledOrders = await Order.countDocuments(cancelledMatchQuery);

  // Calculate growth (compare with previous period)
  const periodLength = endDate - startDate;
  const previousStart = new Date(startDate.getTime() - periodLength);
  const previousEnd = startDate;

  const previousMatchQuery = {
    createdAt: { $gte: previousStart, $lte: previousEnd },
    status: { $ne: 'cancelled' } // Also exclude cancelled from previous period
  };
  if (userId) previousMatchQuery.userId = userId;

  const previousOrders = await Order.find(previousMatchQuery);
  const previousRevenue = previousOrders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  const revenueGrowth =
    previousRevenue > 0
      ? (((totalRevenue - previousRevenue) / previousRevenue) * 100)
      : totalRevenue > 0 ? "100.00" : "0.00";

  const orderGrowth =
    previousOrders.length > 0
      ? (((totalOrders - previousOrders.length) / previousOrders.length) * 100)
      : totalOrders > 0 ? "100.00" : "0.00";

  return {
    totalRevenue: totalRevenue,
    totalOrders,
    totalItemsSold,
    totalProducts,
    lowStockCount,
    cancelledOrders,
    averageOrderValue: (totalRevenue / totalOrders || 0),
    revenueGrowth: `${revenueGrowth}%`,
    orderGrowth: `${orderGrowth}%`,
    previousPeriodRevenue: previousRevenue,
    previousPeriodOrders: previousOrders.length,
  };
}

export async function GET(request) {
  return NextResponse.json(
    {
      message: "Use POST method with reportType parameter",
      availableReports: ["sales", "products", "daily", "payment", "summary"],
    },
    { status: 200 }
  );
}