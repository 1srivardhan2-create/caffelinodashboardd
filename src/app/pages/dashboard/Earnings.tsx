import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function Earnings() {
  const [earnings, setEarnings] = useState<any>({
    totalAmount: 0,
    commission: 0,
    finalAmount: 0,
    completedOrders: []
  });

  const fetchEarningsData = async () => {
    try {
      const [earningsData, ordersData] = await Promise.all([
        api.get('/api/earnings'),
        api.get('/api/orders')
      ]);

      let completedOrders: any[] = [];
      if (Array.isArray(ordersData)) {
        completedOrders = ordersData
          .filter(o => o.orderStatus === 'COMPLETED' || o.status === 'completed' || o.orderStatus === 'completed')
          .map((o: any) => ({
             id: o._id,
             orderId: o.orderId || undefined,
             items: (o.items || []).map((i: any) => ({
                 id: i.menuItem?._id || i._id || Math.random().toString(),
                 name: i.name || i.menuItem?.item_name || 'Item',
                 price: i.price || 0,
                 quantity: i.quantity || 1
             })),
             totalAmount: o.totalAmount || 0,
             completedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(o.createdAt)
          }));
      }

      setEarnings({
        totalAmount: earningsData.totalRevenue || 0,
        commission: (earningsData.totalRevenue || 0) * 0.06,
        finalAmount: earningsData.totalEarnings || 0,
        completedOrders: completedOrders
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  // Calculate current month revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthOrders = earnings.completedOrders.filter((order: any) => {
    const orderDate = order.completedAt;
    return orderDate && 
           orderDate.getMonth() === currentMonth && 
           orderDate.getFullYear() === currentYear;
  });
  const currentMonthRevenue = currentMonthOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);

  // Group orders by month for monthly breakdown
  const monthlyData = earnings.completedOrders.reduce((acc: any, order: any) => {
    if (!order.completedAt) return acc;
    
    const monthYear = `${order.completedAt.toLocaleString('default', { month: 'long' })} ${order.completedAt.getFullYear()}`;
    if (!acc[monthYear]) {
      acc[monthYear] = { revenue: 0, orders: 0 };
    }
    acc[monthYear].revenue += order.totalAmount;
    acc[monthYear].orders += 1;
    return acc;
  }, {} as Record<string, { revenue: number; orders: number }>);

  const monthlyBreakdown = Object.entries(monthlyData)
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .slice(0, 6); // Show last 6 months

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Earnings</h1>
        <p className="text-sm md:text-base text-gray-600">Track your cafe revenue and commissions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <div className="bg-blue-500 p-2 rounded-lg">
              <DollarSign className="size-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{earnings.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1">From completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Revenue
            </CardTitle>
            <div className="bg-purple-500 p-2 rounded-lg">
              <Calendar className="size-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₹{currentMonthRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Earnings
            </CardTitle>
            <div className="bg-green-500 p-2 rounded-lg">
              <TrendingUp className="size-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{earnings.finalAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1">From all completed orders</p>
          </CardContent>
        </Card>
      </div>

      {monthlyBreakdown.length > 0 && (
        <Card className="mb-6 md:mb-8">
          <CardHeader>
            <CardTitle>Monthly Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyBreakdown.map(([month, data]: any) => (
                  <TableRow key={month}>
                    <TableCell className="font-medium">{month}</TableCell>
                    <TableCell className="text-right">{data.orders}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      ₹{data.revenue.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Completed Orders Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Your Earning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.completedOrders.map((order: any) => {
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.orderId || order.id.slice(-6)}</TableCell>
                    <TableCell>
                      {order.completedAt?.toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell className="text-right">₹{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      ₹{(order.totalAmount * 0.94).toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {earnings.completedOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No completed orders yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 md:p-6 bg-orange-50 border border-orange-200 rounded-lg">
        <h3 className="font-semibold text-orange-900 mb-2">Payment Information</h3>
        <p className="text-sm text-orange-800">
          All payments are collected as CASH at the counter. Ensure accurate order completion for smooth earnings tracking.
        </p>
      </div>
    </div>
  );
}