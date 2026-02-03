"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import Title from "../../components/Title";
import Cookies from "js-cookie";

export default function ReportsPage() {
  const role = Cookies.get("role");

  const [reportType, setReportType] = useState(
    role != "admin" ? "daily" : "summary",
  );
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(null);
  const [error, setError] = useState(null);

  const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#6366f1",
  ];

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType, startDate, endDate }),
      });
      const result = await response.json();
      console.log("Full API Response:", result);
      console.log("Report Data:", result.data);

      if (result.success) {
        setReportData(result.data);
        console.log("Report Data:", result.data);
        setPeriod(result.period);
      } else {
        setError(result.message || "Failed to fetch report");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      setError("Network error occurred");
    }
    setLoading(false);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color }) => (
    <div className="bg-white shadow-sm hover:shadow-md p-6 border border-gray-100 rounded-xl transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="mb-1 font-medium text-gray-600 text-sm">{title}</p>
          <h3 className="mb-2 font-bold text-gray-900 text-2xl">{value}</h3>
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${
                parseFloat(trend) >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {parseFloat(trend) >= 0 ? (
                <TrendingUp className="mr-1 w-4 h-4" />
              ) : (
                <TrendingDown className="mr-1 w-4 h-4" />
              )}
              <span className="font-medium">
                {Math.abs(parseFloat(trend))}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const renderSummaryReport = () => {
    if (!reportData) return null;
    return (
      <div className="space-y-6">
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="إجمالي الإيرادات"
            value={`${reportData.totalRevenue?.toFixed(2) || 0} ج.م`}
            subtitle={`من ${reportData.totalOrders || 0} طلب`}
            icon={DollarSign}
            trend={reportData.revenueGrowth}
            color="bg-blue-500"
          />
          <StatCard
            title="إجمالي الطلبات"
            value={reportData.totalOrders || 0}
            subtitle={`متوسط: ${
              reportData.averageOrderValue?.toFixed(2) || 0
            } ج.م`}
            icon={ShoppingCart}
            color="bg-purple-500"
          />
          <StatCard
            title="القطع المباعة"
            value={reportData.totalItemsSold || 0}
            subtitle={`من ${reportData.totalProducts || 0} منتج`}
            icon={Package}
            color="bg-pink-500"
          />
          <StatCard
            title="تنبيه المخزون"
            value={reportData.lowStockCount || 0}
            subtitle="منتج منخفض المخزون"
            icon={AlertTriangle}
            color="bg-orange-500"
          />
        </div>

        {/* Additional Summary Stats */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
          <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-xl">
            <h4 className="mb-2 font-semibold text-gray-700 text-sm">
              الطلبات المعلقة
            </h4>
            <p className="font-bold text-2xl text-yellow-600">
              {reportData.pendingOrders || 0}
            </p>
            <p className="mt-1 text-gray-500 text-sm">قيد الانتظار</p>
          </div>
          <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-xl">
            <h4 className="mb-2 font-semibold text-gray-700 text-sm">
              الطلبات الملغاة
            </h4>
            <p className="font-bold text-2xl text-red-600">
              {reportData.cancelledOrders || 0}
            </p>
            <p className="mt-1 text-gray-500 text-sm">تم الإلغاء</p>
          </div>
          <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-xl">
            <h4 className="mb-2 font-semibold text-gray-700 text-sm">
              الفترة السابقة
            </h4>
            <p className="font-bold text-2xl text-gray-700">
              {reportData.previousPeriodRevenue?.toFixed(2) || 0} ج.م
            </p>
            <p className="mt-1 text-gray-500 text-sm">
              {reportData.previousPeriodOrders || 0} طلب
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderSalesReport = () => {
    if (!reportData) return null;

    const paymentData = reportData.paymentBreakdown
      ? Object.entries(reportData.paymentBreakdown).map(([key, value]) => ({
          name: key === "cash" ? "نقدي" : key,
          value: parseFloat(value),
        }))
      : [];

    return (
      <div className="space-y-6">
        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
          <StatCard
            title="إجمالي المبيعات"
            value={`${reportData.totalSales?.toFixed(2) || 0} ج.م`}
            icon={DollarSign}
            color="bg-blue-500"
          />
          <StatCard
            title="عدد الطلبات"
            value={reportData.totalOrders || 0}
            icon={ShoppingCart}
            color="bg-purple-500"
          />
          <StatCard
            title="متوسط قيمة الطلب"
            value={`${reportData.averageOrderValue?.toFixed(2) || 0} ج.م`}
            icon={TrendingUp}
            color="bg-green-500"
          />
        </div>

        {/* Payment Breakdown */}
        {paymentData.length > 0 && (
          <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-xl">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">
              توزيع طرق الدفع
            </h3>
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center space-y-3">
                {paymentData.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="rounded w-4 h-4"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="font-medium text-gray-700">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {item.value.toFixed(2)} ج.م
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Daily Sales Chart */}
        {reportData.dailySales && reportData.dailySales.length > 0 && (
          <div className="bg-white shadow-sm border border-gray-100 rounded-xl">
            <h3 className="mb-4 p-6 font-semibold text-gray-900 text-lg">
              المبيعات اليومية
            </h3>
            <ResponsiveContainer className="md:p-6 w-full" height={300}>
              <LineChart data={reportData.dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#374151", fontWeight: "bold" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="المبيعات"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="الطلبات"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Discount Info */}
        {reportData.totalDiscount > 0 && (
          <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-xl">
            <h3 className="mb-2 font-semibold text-gray-900 text-lg">
              إجمالي الخصومات
            </h3>
            <p className="font-bold text-3xl text-orange-600">
              {reportData.totalDiscount.toFixed(2)} ج.م
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderProductsReport = () => {
    if (!reportData) {
      return (
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-yellow-800">لا توجد بيانات للعرض</p>
        </div>
      );
    }

    console.log("Products Report Data:", reportData);
    console.log("Top Products:", reportData.topProducts);
    console.log("Low Stock Products:", reportData.lowStockProducts);

    const hasTopProducts =
      reportData.topProducts && reportData.topProducts.length > 0;
    const hasLowStock =
      reportData.lowStockProducts && reportData.lowStockProducts.length > 0;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
          <StatCard
            title="إجمالي المنتجات المباعة"
            value={reportData.totalProductsSold || 0}
            subtitle="منتج مختلف"
            icon={Package}
            color="bg-blue-500"
          />
          <StatCard
            title="أفضل المنتجات"
            value={hasTopProducts ? reportData.topProducts.length : 0}
            subtitle="منتج في القائمة"
            icon={TrendingUp}
            color="bg-green-500"
          />
          <StatCard
            title="منتجات منخفضة المخزون"
            value={hasLowStock ? reportData.lowStockProducts.length : 0}
            subtitle="يحتاج إعادة طلب"
            icon={AlertTriangle}
            color="bg-red-500"
          />
        </div>

        {/* Top Products Chart */}
        <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-xl">
          <h3 className="mb-4 font-semibold text-gray-900 text-lg">
            أفضل المنتجات مبيعاً (أعلى 10)
          </h3>
          {hasTopProducts ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportData.topProducts.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  style={{ fontSize: "11px" }}
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [
                    `${value.toFixed(2)} ج.م`,
                    "الإيرادات",
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="الإيرادات (ج.م)" />
                <Bar
                  dataKey="quantitySold"
                  fill="#10b981"
                  name="الكمية المباعة"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <Package className="mx-auto mb-3 w-12 h-12 text-gray-400" />
              <p className="text-gray-600">
                لا توجد منتجات مباعة في هذه الفترة
              </p>
            </div>
          )}
        </div>

        {/* Top Products Table */}
        {hasTopProducts && (
          <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-xl">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">
              تفاصيل أفضل المنتجات
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-gray-200 border-b">
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right text-sm">
                      #
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right text-sm">
                      المنتج
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right text-sm">
                      الكمية المباعة
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right text-sm">
                      الإيرادات
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right text-sm">
                      مرات الطلب
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topProducts.map((product, index) => (
                    <tr
                      key={product.productId || index}
                      className="hover:bg-gray-50 border-gray-100 border-b"
                    >
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-gray-900 text-sm">
                        {product.quantitySold}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                        {product.revenue.toFixed(2)} ج.م
                      </td>
                      <td className="px-4 py-3 text-gray-900 text-sm">
                        {product.timesOrdered}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Low Stock Products */}
        <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-xl">
          <h3 className="mb-4 font-semibold text-gray-900 text-lg">
            منتجات منخفضة المخزون
          </h3>
          {hasLowStock ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-gray-200 border-b">
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right text-sm">
                      المنتج
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right text-sm">
                      المخزون الحالي
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right text-sm">
                      الحد الأدنى
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right text-sm">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.lowStockProducts.map((product, index) => (
                    <tr
                      key={product._id || index}
                      className="hover:bg-gray-50 border-gray-100 border-b"
                    >
                      <td className="px-4 py-3 text-gray-900 text-sm">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-gray-900 text-sm">
                        <span
                          className={
                            product.stock === 0 ? "text-red-600 font-bold" : ""
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900 text-sm">
                        {product.minStock}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium text-xs ${
                            product.stock === 0
                              ? "bg-red-200 text-red-900"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {product.stock === 0 ? "نفذ المخزون" : "منخفض"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-green-50 p-8 rounded-lg text-center">
              <Package className="mx-auto mb-3 w-12 h-12 text-green-500" />
              <p className="text-green-700 font-medium">
                جميع المنتجات في مستوى مخزون جيد!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDailyReport = () => {
    if (
      !reportData ||
      !reportData.dailyReport ||
      reportData.dailyReport.length === 0
    ) {
      return (
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-yellow-800">لا توجد بيانات يومية للعرض</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Daily Chart */}
        {role == "admin" && (
          <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-xl">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">
              رسم بياني للمبيعات اليومية
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.dailyReport}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="totalSales" fill="#3b82f6" name="المبيعات" />
                <Bar dataKey="cash" fill="#10b981" name="نقدي" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Daily Table */}
        <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-xl">
          <h3 className="mb-4 font-semibold text-gray-900 text-lg">
            التقرير اليومي التفصيلي
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-gray-200 border-b">
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right text-sm">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right text-sm">
                    المبيعات
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right text-sm">
                    الطلبات
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right text-sm">
                    المنتجات
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.dailyReport.map((day, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 border-gray-100 border-b"
                  >
                    <td className="px-4 py-3 text-gray-900 text-sm">
                      {new Date(day.date).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                      {day.totalSales.toFixed(2)} ج.م
                    </td>
                    <td className="px-4 py-3 text-gray-900 text-sm">
                      {day.totalOrders}
                    </td>
                    <td className="px-4 py-3 text-gray-900 text-sm">
                      {day.totalItems}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-gray-300 bg-gray-50 border-t-2 font-bold">
                  <td className="px-4 py-3 text-gray-900 text-sm">الإجمالي</td>
                  <td className="px-4 py-3 text-gray-900 text-sm">
                    {reportData.dailyReport
                      .reduce((sum, day) => sum + day.totalSales, 0)
                      .toFixed(2)}{" "}
                    ج.م
                  </td>
                  <td className="px-4 py-3 text-gray-900 text-sm">
                    {reportData.dailyReport.reduce(
                      (sum, day) => sum + day.totalOrders,
                      0,
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-900 text-sm">
                    {reportData.dailyReport.reduce(
                      (sum, day) => sum + day.totalItems,
                      0,
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* العنوان */}
      <Title
        settings
        title="التقارير والتحليلات"
        subTitle="عرض شامل لأداء نقاط البيع"
      />

      {/* Filters */}
      <div className="bg-white shadow-sm mx-4 mb-6 p-6 border border-gray-100 rounded-xl">
        <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              نوع التقرير
            </label>
            <select
              disabled={role != "admin"}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
            >
              <option value="summary">ملخص</option>
              <option value="sales">المبيعات</option>
              <option value="products">المنتجات</option>
              <option value="daily">يومي</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              من تاريخ
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg w-full text-white transition-colors disabled:cursor-not-allowed"
            >
              {loading ? (
                "جاري التحميل..."
              ) : (
                <>
                  <Filter className="w-4 h-4" />
                  <span>تطبيق</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="border-blue-600 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      ) : (
        <div className="px-4">
          {reportType === "summary" && renderSummaryReport()}
          {reportType === "sales" && renderSalesReport()}
          {reportType === "products" && renderProductsReport()}
          {reportType === "daily" && renderDailyReport()}
        </div>
      )}
    </div>
  );
}
