import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';
import { CheckCircle, Truck, Package, ChevronDown, ChevronUp } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const { data, error } = await supabase.rpc('admin_get_orders');
    if (error) {
      console.error('Failed to fetch orders:', error.message);
      return;
    }
    setOrders((data as unknown as any[]) || []);
  };

  useEffect(() => { fetchOrders(); }, []);

  // Realtime: listen for new/updated orders
  useEffect(() => {
  // 🔥 CLEAR OLD CHANNELS
  supabase.removeAllChannels();

  const channel = supabase
    .channel(`admin-orders-${Date.now()}`) // unique name
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      () => { fetchOrders(); }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
  const updateStatus = async (order: any, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', order.id);

    // Send notification to client if they have a user_id
    if (order.user_id) {
      const messages: Record<string, { title: string; message: string }> = {
        confirmed: {
          title: 'Order Confirmed! ✅',
          message: `Your order #${order.id.slice(0, 8).toUpperCase()} has been confirmed and is being processed.`,
        },
        ready_to_ship: {
          title: 'Ready to Ship! 🚚',
          message: `Your order #${order.id.slice(0, 8).toUpperCase()} is packed and ready to ship.`,
        },
        delivered: {
          title: 'Order Delivered! 🎉',
          message: `Your order #${order.id.slice(0, 8).toUpperCase()} has been delivered. Thank you for shopping with LUXE! We hope you love your purchase.`,
        },
      };

      const notifData = messages[status];
      if (notifData) {
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          type: `order_${status}`,
          title: notifData.title,
          message: notifData.message,
          order_id: order.id,
        });
      }
    }

    fetchOrders();
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    ready_to_ship: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl tracking-wider mb-6">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-center text-muted-foreground font-body py-8">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-4 text-left">
                  <div>
                    <p className="text-sm font-body font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground font-body">
                      {order.first_name} {order.last_name} • {order.phone}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm font-body font-bold">{formatPrice(order.total)}</span>
                  {expandedId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {expandedId === order.id && (
                <div className="border-t border-border p-4 space-y-4 bg-surface/50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-body">
                    <div><span className="text-muted-foreground">Email:</span> <p>{order.email || '-'}</p></div>
                    <div><span className="text-muted-foreground">Phone:</span> <p>{order.phone || '-'}</p></div>
                    <div><span className="text-muted-foreground">City:</span> <p>{order.city || '-'}</p></div>
                    <div><span className="text-muted-foreground">Address:</span> <p>{order.address || '-'}</p></div>
                  </div>

                  {order.payment_method && (
                    <div className="text-xs font-body">
                      <span className="text-muted-foreground">Payment:</span> <span className="font-medium uppercase">{order.payment_method}</span>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground font-body mb-2">Items:</p>
                    <div className="space-y-2">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 bg-background rounded-lg p-2">
                          <div className="w-10 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                            {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-body font-medium">{item.product_name}</span>
                            <div className="flex gap-2 mt-0.5">
                              {item.selected_size && (
                                <span className="text-[10px] font-body bg-gold/10 text-gold px-1.5 py-0.5 rounded">Size: {item.selected_size}</span>
                              )}
                              <span className="text-[10px] font-body text-muted-foreground">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="text-xs font-body font-medium">{formatPrice(item.product_price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.discount_code && (
                    <div className="text-xs font-body text-gold">
                      Discount: {order.discount_code} (-{formatPrice(order.discount_amount || 0)})
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {order.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(order, 'confirmed')}>
                        <CheckCircle size={14} /> Confirm
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(order, 'ready_to_ship')}>
                        <Truck size={14} /> Ready to Ship
                      </Button>
                    )}
                    {order.status === 'ready_to_ship' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(order, 'delivered')}>
                        <Package size={14} /> Delivered
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
