import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Package, Clock, Truck, CheckCircle, LogOut, ShieldCheck } from 'lucide-react';

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-500' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-500' },
  ready_to_ship: { label: 'Ready to Ship', icon: Truck, color: 'text-purple-500' },
  delivered: { label: 'Delivered', icon: Package, color: 'text-green-500' },
  cancelled: { label: 'Cancelled', icon: Clock, color: 'text-destructive' },
};

const Dashboard = () => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoadingOrders(false);
  };

  // Link guest orders on first login
  useEffect(() => {
    if (!user) return;
    const linkGuestOrders = async () => {
      const guestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
      if (guestOrders.length > 0) {
        // Update orders that have no user_id
        for (const orderId of guestOrders) {
          await supabase
            .from('orders')
            .update({ user_id: user.id })
            .eq('id', orderId)
            .is('user_id', null);
        }
        localStorage.removeItem('guest_orders');
      }
      fetchOrders();
    };
    linkGuestOrders();
  }, [user]);

  // Realtime order updates
  useEffect(() => {
  if (!user) return;

  // 🔥 CLEAR OLD CHANNELS
  supabase.removeAllChannels();

  const channel = supabase
    .channel(`user-orders-${user.id}-${Date.now()}`) // unique
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`,
      },
      () => { fetchOrders(); }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user?.id]);

  if (loading) return <Layout><div className="container py-20 text-center font-body">Loading...</div></Layout>;
  if (!user) return null;

  return (
    <Layout>
      <div className="container py-8 md:py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl tracking-wider">My Account</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            {isAdmin && (
              <Button variant="luxury-outline" size="sm" asChild>
                <Link to="/admin"><ShieldCheck size={14} /> Admin</Link>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => { signOut(); navigate('/'); }}>
              <LogOut size={14} /> Logout
            </Button>
          </div>
        </div>

        <h2 className="font-heading text-xl tracking-wider mb-4">My Orders</h2>

        {loadingOrders ? (
          <p className="text-muted-foreground font-body">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-lg">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="font-body text-muted-foreground mb-4">No orders yet</p>
            <Button variant="luxury" asChild>
              <Link to="/collections">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const sc = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = sc.icon;
              return (
                <div key={order.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-body">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground font-body">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-body font-medium ${sc.color}`}>
                      <StatusIcon size={14} /> {sc.label}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-12 rounded overflow-hidden bg-surface">
                          {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-body truncate">{item.product_name}</p>
                          {item.selected_size && <p className="text-[10px] text-gold font-body">Size: {item.selected_size}</p>}
                        </div>
                        <span className="text-xs font-body">×{item.quantity}</span>
                        <span className="text-xs font-body font-medium">{formatPrice(item.product_price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground font-body">{order.order_items?.length || 0} item(s)</span>
                    <span className="text-sm font-body font-bold">{formatPrice(order.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
