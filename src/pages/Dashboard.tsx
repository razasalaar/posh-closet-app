import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Package, Clock, Truck, CheckCircle, LogOut, ShieldCheck, ShoppingBag } from 'lucide-react';

const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  ready_to_ship: { label: 'Ready to Ship', icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  delivered: { label: 'Delivered', icon: Package, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  cancelled: { label: 'Cancelled', icon: Clock, color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

const Dashboard = () => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error.message);
    } else {
      setOrders((data as unknown as any[]) || []);
    }
    setLoadingOrders(false);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  // Link guest orders and fetch
  useEffect(() => {
    if (!user) return;
    const linkGuestOrders = async () => {
      const guestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
      if (guestOrders.length > 0) {
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
  }, [user, fetchOrders]);

  // Realtime order updates
  useEffect(() => {
    if (!user) return;

    // 🛡️ DO NOT use supabase.removeAllChannels() - it kills the notification bell!
    const channel = supabase
      .channel(`user-orders-${user.id}`)
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
  }, [user?.id, fetchOrders]);

  if (loading) return <Layout><div className="flex items-center justify-center min-h-[60vh] font-body">Loading your account...</div></Layout>;
  if (!user) return null;

  return (
    <Layout>
      <div className="container py-8 md:py-16 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-fade-in">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl tracking-tighter mb-2">My Account</h1>
            <div className="flex items-center gap-2 text-muted-foreground font-body text-sm">
              <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-foreground">Customer</span>
              <span>{user.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="outline" size="sm" asChild className="h-10 px-4 border-gold/30 text-gold hover:bg-gold/5">
                <Link to="/admin" className="flex items-center gap-2"><ShieldCheck size={16} /> Admin Panel</Link>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => { signOut(); navigate('/'); }} className="h-10 px-4">
              <LogOut size={16} className="mr-2" /> Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10">
          <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl tracking-wider flex items-center gap-2">
                <ShoppingBag size={20} className="text-gold" /> Order History
              </h2>
            </div>

            {loadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-32 bg-surface animate-pulse rounded-xl border border-border" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-surface/30 rounded-2xl border-2 border-dashed border-border shadow-sm">
                <Package size={48} className="mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="font-heading text-lg mb-2">No orders found</h3>
                <p className="font-body text-sm text-muted-foreground mb-8">You haven't placed any orders yet.</p>
                <Button variant="luxury" asChild className="px-8">
                  <Link to="/collections">Back to Shop</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const sc = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <div key={order.id} className="group bg-background border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-gold/20 transition-all duration-300">
                      <div className="p-4 md:p-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${sc.bgColor} ${sc.color} shadow-sm`}>
                              <StatusIcon size={20} />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">Order ID</p>
                              <p className="text-sm font-body font-bold text-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <div className="h-8 w-px bg-border hidden sm:block" />
                            <div className="hidden sm:block">
                              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">Date</p>
                              <p className="text-sm font-body text-foreground">{new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${sc.bgColor} ${sc.color}`}>
                             {sc.label}
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-4 group/item">
                              <div className="relative flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden bg-muted border border-border/50 group-hover/item:border-gold/30 transition-colors">
                                {item.product_image ? (
                                  <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-muted-foreground" /></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-gold uppercase tracking-wider mb-0.5">{item.product_brand || 'LUXE'}</p>
                                <p className="text-sm font-body font-bold truncate group-hover/item:text-gold transition-colors">{item.product_name}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  {item.selected_size && (
                                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium">Size: {item.selected_size}</span>
                                  )}
                                  <span className="text-[10px] text-muted-foreground">Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-body font-bold">{formatPrice(item.product_price * item.quantity)}</p>
                              </div>
                            </div>
                          ))}
                          {(!order.order_items || order.order_items.length === 0) && (
                            <p className="text-xs text-muted-foreground italic font-body py-2">Item details unavailable</p>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-5 border-t border-border mt-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{order.order_items?.length || 0} ITEMS</span>
                            <span className="text-xs font-body text-muted-foreground">Paid via {order.payment_method?.toUpperCase()}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Amount</p>
                            <p className="text-xl font-heading text-foreground tracking-tight">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
