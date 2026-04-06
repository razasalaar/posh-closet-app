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
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', id);
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

                  <div>
                    <p className="text-xs text-muted-foreground font-body mb-2">Items:</p>
                    <div className="space-y-2">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-8 h-10 rounded overflow-hidden bg-muted">
                            {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-body">{item.product_name}</span>
                            {item.selected_size && (
                              <p className="text-[10px] text-gold font-body">Size: {item.selected_size}</p>
                            )}
                          </div>
                          <span className="text-xs font-body">×{item.quantity}</span>
                          <span className="text-xs font-body font-medium">{formatPrice(item.product_price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {order.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, 'confirmed')}>
                        <CheckCircle size={14} /> Confirm
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, 'ready_to_ship')}>
                        <Truck size={14} /> Ready to Ship
                      </Button>
                    )}
                    {order.status === 'ready_to_ship' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, 'delivered')}>
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
