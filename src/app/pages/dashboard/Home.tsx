import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ShoppingBag, Clock, DollarSign, CheckCircle2, CheckCircle, Package, Trash2, Undo2, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardHome() {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    try {
      const data = await api.get('/api/orders');
      if (Array.isArray(data)) {
        const mappedOrders = data
          .filter((o: any) => {
             const stat = (o.orderStatus || o.status || 'PENDING').toUpperCase();
             // Only show orders that have paid the token or are further along
             const paidStatuses = ['ACCEPTED', 'TOKEN_PAID', 'CONFIRMED', 'COMPLETED', 'CASH_COLLECTED', 'READY'];
             return paidStatuses.includes(stat);
          })
          .map((o: any) => {
             const rawStat = (o.orderStatus || o.status || 'PENDING').toUpperCase();
             let feStatus = 'pending';
             if (['COMPLETED', 'CASH_COLLECTED'].includes(rawStat)) {
               feStatus = 'completed';
             } else if (['ACCEPTED', 'CONFIRMED', 'TOKEN_PAID', 'READY'].includes(rawStat)) {
               feStatus = 'confirmed';
             }

             return {
               id: o._id,
               orderId: o.orderId || undefined,
               userName: o.userName || o.user?.name || undefined,
               items: (o.items || []).map((i: any) => ({
                 id: i.menuItem?._id || i._id || Math.random().toString(),
                 name: i.name || i.menuItem?.item_name || 'Item',
                 price: i.price || 0,
                 quantity: i.quantity || 1
               })),
               subtotal: o.subtotal || 0,
               cgst: o.cgst || 0,
               sgst: o.sgst || 0,
               totalAmount: o.totalAmount || 0,
               status: feStatus,
               createdAt: new Date(o.createdAt),
               isDeleted: o.isDeleted || false
             };
          });
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const activeOrders = orders.filter(o => !o.isDeleted);
  const deletedOrders = orders.filter(o => o.isDeleted);

  const todayOrders = activeOrders;
  const pendingOrders = activeOrders.filter(o => o.status === 'pending');
  const confirmedOrders = activeOrders.filter(o => o.status === 'confirmed');
  const completedOrders = activeOrders.filter(o => o.status === 'completed');

  const handlePrintReceipt = (order: any) => {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return toast.error('Pop-up blocked. Please allow pop-ups to print.');

    const itemsHtml = order.items.map((item: any) => `
      <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px;">
        <span>${item.name} x${item.quantity}</span>
        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Receipt #${order.orderId || order.id.slice(-6)}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0; padding: 10px; color: #000; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .flex-between { display: flex; justify-content: space-between; }
            @media print { @page { margin: 0; } body { margin: 1cm; } }
          </style>
        </head>
        <body>
          <h2 class="text-center">CAFFELINO</h2>
          <div class="text-center" style="font-size: 14px; margin-bottom: 10px;">
            Order #${order.orderId || order.id.slice(-6)}
          </div>
          ${order.userName ? `<div style="font-size: 14px; margin-bottom: 5px;">Customer: ${order.userName}</div>` : ''}
          <div style="font-size: 14px; margin-bottom: 15px;">Date: ${new Date(order.createdAt).toLocaleString()}</div>
          
          <div class="divider"></div>
          ${itemsHtml}
          <div class="divider"></div>
          
          <div class="flex-between" style="font-size: 14px; margin-bottom: 5px;">
            <span>Subtotal:</span>
            <span>₹${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="flex-between" style="font-size: 14px; margin-bottom: 5px;">
            <span>CGST:</span>
            <span>₹${order.cgst.toFixed(2)}</span>
          </div>
          <div class="flex-between" style="font-size: 14px; margin-bottom: 5px;">
            <span>SGST:</span>
            <span>₹${order.sgst.toFixed(2)}</span>
          </div>
          
          <div class="divider"></div>
          <div class="flex-between font-bold" style="font-size: 16px;">
            <span>TOTAL:</span>
            <span>₹${order.totalAmount.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          
          <div class="text-center font-bold" style="font-size: 14px; margin-top: 20px;">
            THANK YOU!
          </div>
          
          <script>
            window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleAccept = async (orderId: string) => {
    try {
      // Still using the old status endpoint or we can assume it works when we fix backend cafeApproved bug
      await api.patch(`/api/cafe/orders/${orderId}/status`, { status: "ACCEPTED" });
      toast.success('Order accepted!');
      fetchOrders();
    } catch (e) {
      toast.error('Failed to accept order');
    }
  };

  const handleComplete = async (orderId: string) => {
    try {
      await api.put(`/api/orders/complete/${orderId}`, {});
      toast.success('Order completed! Added to earnings.');
      fetchOrders();
    } catch (e) {
      toast.error('Failed to complete order');
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await api.patch(`/api/cafe/orders/${orderId}/delete`, {});
      toast.info("Moved to Trash");
      fetchOrders();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const restoreOrder = async (orderId: string) => {
    try {
      await api.patch(`/api/cafe/orders/${orderId}/restore`, {});
      toast.success("Order Restored!");
      fetchOrders();
    } catch (e) {
      toast.error("Failed to restore");
    }
  };

  const stats = [
    {
      title: 'Total Orders Today',
      value: todayOrders.length,
      icon: ShoppingBag,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.length,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Completed Orders',
      value: completedOrders.length,
      icon: CheckCircle2,
      color: 'bg-green-500'
    },
    {
      title: 'Earnings Today',
      value: `₹${completedOrders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-orange-500'
    }
  ];

  const OrderCard = ({ order }: { order: any }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              Order #{order.orderId || order.id.slice(-6)}
            </CardTitle>
            {order.userName && (
              <p className="text-sm font-medium text-orange-600 mt-0.5">
                Customer: {order.userName}
              </p>
            )}
            <p className="text-sm text-gray-600">
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!order.isDeleted && (
              <button 
                onClick={() => {deleteOrder(order.id); toast.info("Moved to Trash");}}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Delete Order"
              >
                <Trash2 className="size-4" />
              </button>
            )}
            <Badge
              className={
                order.status === 'pending' ? 'bg-yellow-500' :
                order.status === 'confirmed' ? 'bg-blue-500' :
                'bg-green-500'
              }
            >
              {order.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>CGST</span>
            <span>₹{order.cgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>SGST</span>
            <span>₹{order.sgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <Package className="size-4" />
            Payment: CASH at counter
          </div>
        </div>

        {order.isDeleted ? (
          <Button
            className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={() => {restoreOrder(order.id); toast.success("Order Restored!");}}
          >
            <Undo2 className="mr-2 size-4" />
            Restore Order
          </Button>
        ) : (
          <>
            {order.status === 'pending' && (
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={() => handleAccept(order.id)}
              >
                <CheckCircle className="mr-2 size-4" />
                Accept Order
              </Button>
            )}

            {order.status === 'confirmed' && (
              <div className="space-y-2">
                <Button
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={() => handleComplete(order.id)}
                >
                  <CheckCircle className="mr-2 size-4" />
                  Complete Order
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => handlePrintReceipt(order)}
                >
                  <Printer className="mr-2 size-4" />
                  Print Receipt
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600">Welcome back! Here's your cafe overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="size-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-6 md:space-y-8">
        {/* Pending Orders */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-5 text-yellow-500" />
            <h2 className="text-lg md:text-xl font-semibold">Pending Orders ({pendingOrders.length})</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {pendingOrders.length === 0 && (
              <p className="text-gray-500 col-span-full text-center py-8">No pending orders</p>
            )}
          </div>
        </div>

        {/* Confirmed Orders */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="size-5 text-blue-500" />
            <h2 className="text-lg md:text-xl font-semibold">Confirmed Orders ({confirmedOrders.length})</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {confirmedOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {confirmedOrders.length === 0 && (
              <p className="text-gray-500 col-span-full text-center py-8">No confirmed orders</p>
            )}
          </div>
        </div>

        {/* Completed Orders */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="size-5 text-green-500" />
            <h2 className="text-lg md:text-xl font-semibold">Completed Orders ({completedOrders.length})</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {completedOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {completedOrders.length === 0 && (
              <p className="text-gray-500 col-span-full text-center py-8">No completed orders yet</p>
            )}
          </div>
        </div>

        {/* Deleted Orders */}
        {deletedOrders.length > 0 && (
          <div className="pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="size-5 text-red-500" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-700">Recently Deleted ({deletedOrders.length})</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 opacity-75">
              {deletedOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}