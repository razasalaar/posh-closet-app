import { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';
import { CheckCircle, Truck, Package, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

type OrderStatus = Database['public']['Enums']['order_status'];
type DateFilter = 'all' | 'today' | 'weekly' | 'monthly' | 'custom';

const AdminOrders = () => {
  const { loading: authLoading, isAdmin } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [advanceInputs, setAdvanceInputs] = useState<Record<string, string>>({});

  // Filter state
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchOrders = useCallback(async () => {
    if (authLoading || !isAdmin) return;

    setLoading(true);
    let start: string | null = null;
    let end: string | null = null;

    const now = new Date();
    if (dateFilter === 'today') {
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      start = todayStart.toISOString();
    } else if (dateFilter === 'weekly') {
      const pre7 = new Date(now);
      pre7.setDate(now.getDate() - 7);
      pre7.setHours(0, 0, 0, 0);
      start = pre7.toISOString();
    } else if (dateFilter === 'monthly') {
      const pre30 = new Date(now);
      pre30.setDate(now.getDate() - 30);
      pre30.setHours(0, 0, 0, 0);
      start = pre30.toISOString();
    } else if (dateFilter === 'custom') {
      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        start = sDate.toISOString();
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        end = eDate.toISOString();
      }
    }

    let query = supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    if (start) query = query.gte('created_at', start);
    if (end) query = query.lte('created_at', end);

    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to fetch orders:', error.message);
      setOrders([]);
      setTotalCount(0);
    } else {
      setOrders(data ?? []);
      setTotalCount(count ?? 0);
    }

    setLoading(false);
  }, [authLoading, isAdmin, currentPage, dateFilter, startDate, endDate]);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchOrders();
    }
  }, [authLoading, isAdmin, fetchOrders]);

  // Realtime: listen for new/updated orders
  useEffect(() => {
    if (authLoading || !isAdmin) return;

    // 🛡️ DO NOT use supabase.removeAllChannels() here!
    // It would kill the NotificationBell listener in AdminLayout.
    const channel = supabase
      .channel('admin-orders-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => { fetchOrders(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authLoading, isAdmin, fetchOrders]);

  const updateStatus = async (order: any, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', order.id);

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
          message: `Your order #${order.id.slice(0, 8).toUpperCase()} has been delivered.`,
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

  const verifyPayment = async (order: any, enteredAdvance?: number) => {
    let updateData: any = { advance_status: 'verified', status: 'confirmed' };
    
    if (order.payment_method === 'whatsapp_cod' && enteredAdvance !== undefined) {
      updateData.advance_amount = enteredAdvance;
      updateData.remaining_amount = Math.max(0, order.total - enteredAdvance);
    }
    
    await supabase.from('orders').update(updateData).eq('id', order.id);
    
    if (order.user_id) {
      const msg = order.payment_method === 'whatsapp_cod' && enteredAdvance !== undefined
        ? `Your advance payment of ${formatPrice(enteredAdvance)} has been confirmed. Remaining ${formatPrice(Math.max(0, order.total - enteredAdvance))} will be collected on delivery.`
        : `Your advance payment for order #${order.id.slice(0, 8).toUpperCase()} has been verified and your order is confirmed.`;
        
      await supabase.from('notifications').insert({
        user_id: order.user_id,
        type: `order_confirmed`,
        title: 'Payment Verified! ✅',
        message: msg,
        order_id: order.id,
      });
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

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="font-heading text-2xl tracking-wider">Orders</h1>
        
        <div className="flex flex-wrap items-center gap-1 bg-surface p-1.5 rounded-lg border border-border shadow-sm">
          <Filter size={14} className="text-muted-foreground ml-1 mr-1" />
          <Button 
            variant={dateFilter === 'all' ? 'luxury' : 'ghost'} 
            size="sm" 
            onClick={() => { setDateFilter('all'); setCurrentPage(1); }}
            className="text-[10px] h-7 px-2.5"
          >
            All
          </Button>
          <Button 
            variant={dateFilter === 'today' ? 'luxury' : 'ghost'} 
            size="sm" 
            onClick={() => { setDateFilter('today'); setCurrentPage(1); }}
            className="text-[10px] h-7 px-2.5"
          >
            Today
          </Button>
          <Button 
            variant={dateFilter === 'weekly' ? 'luxury' : 'ghost'} 
            size="sm" 
            onClick={() => { setDateFilter('weekly'); setCurrentPage(1); }}
            className="text-[10px] h-7 px-2.5"
          >
            Weekly
          </Button>
          <Button 
            variant={dateFilter === 'monthly' ? 'luxury' : 'ghost'} 
            size="sm" 
            onClick={() => { setDateFilter('monthly'); setCurrentPage(1); }}
            className="text-[10px] h-7 px-2.5"
          >
            Monthly
          </Button>
          <Button 
            variant={dateFilter === 'custom' ? 'luxury' : 'ghost'} 
            size="sm" 
            onClick={() => { setDateFilter('custom'); setCurrentPage(1); }}
            className="text-[10px] h-7 px-2.5"
          >
            Custom
          </Button>
        </div>
      </div>

      {dateFilter === 'custom' && (
        <div className="bg-surface border border-border rounded-lg p-4 mb-6 animate-fade-in shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <Label className="text-[10px] uppercase font-body text-muted-foreground mb-1 block">From Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} 
                  className="pl-9 h-9 text-xs font-body"
                />
              </div>
            </div>
            <div>
              <Label className="text-[10px] uppercase font-body text-muted-foreground mb-1 block">To Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} 
                  className="pl-9 h-9 text-xs font-body"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-body text-muted-foreground animate-pulse">Fetching orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-surface/30 rounded-xl border border-dashed border-border shadow-sm">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Filter size={20} className="text-muted-foreground" />
          </div>
          <h3 className="font-heading text-base tracking-wider mb-1">No Orders Found</h3>
          <p className="text-xs text-muted-foreground font-body">Try adjusting your filters or date range.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {orders.map((order) => (
              <div key={order.id} className="border border-border rounded-xl overflow-hidden bg-background hover:shadow-lg transition-all duration-300">
                <button
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-surface/50 transition-colors"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex flex-col">
                      <p className="text-sm font-body font-bold text-gold tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs font-medium font-body mt-0.5">
                        {order.first_name} {order.last_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-body">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-body text-muted-foreground">{order.phone}</p>
                    </div>
                    <span className={`text-[9px] font-bold font-body px-2.5 py-1 rounded-full uppercase tracking-wider ${statusColors[order.status as string] || 'bg-muted text-muted-foreground'}`}>
                      {(order.status as string).replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold font-body min-w-[80px] text-right">{formatPrice(order.total)}</span>
                    <div className={`p-1 rounded-full bg-muted/50 transition-transform duration-300 ${expandedId === order.id ? 'rotate-180' : ''}`}>
                      <ChevronDown size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                </button>

                {expandedId === order.id && (
                  <div className="border-t border-border p-5 space-y-6 bg-surface/20 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[11px] font-body">
                      <div className="space-y-1.5 p-3 rounded-lg bg-background border border-border/40 shadow-sm">
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-widest">Customer Email</span>
                        <p className="font-medium truncate">{order.email || '-'}</p>
                      </div>
                      <div className="space-y-1.5 p-3 rounded-lg bg-background border border-border/40 shadow-sm">
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-widest">Phone Number</span>
                        <p className="font-medium">{order.phone || '-'}</p>
                      </div>
                      <div className="space-y-1.5 p-3 rounded-lg bg-background border border-border/40 shadow-sm">
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-widest">Delivery City</span>
                        <p className="font-medium">{order.city || '-'}</p>
                      </div>
                      <div className="space-y-1.5 p-3 rounded-lg bg-background border border-border/40 shadow-sm">
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-widest">Shipping Address</span>
                        <p className="font-medium leading-relaxed">{order.address || '-'}</p>
                      </div>
                      <div className="space-y-1.5 p-3 rounded-lg bg-background border border-border/40 shadow-sm col-span-2 md:col-span-4 flex flex-wrap gap-4 items-center">
                         <div>
                           <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-widest">Advance Payment</span>
                           <p className="font-medium text-gold">{order.advance_amount ? formatPrice(order.advance_amount) : 'None'}</p>
                         </div>
                         <div>
                           <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-widest">Remaining</span>
                           <p className="font-medium">{order.remaining_amount ? formatPrice(order.remaining_amount) : formatPrice(order.total)}</p>
                         </div>
                         <div>
                           <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-widest">Advance Status</span>
                           <span className={`text-xs px-2 py-0.5 rounded font-semibold ${order.advance_status === 'verified' ? 'bg-green-100 text-green-800' : order.advance_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-muted text-muted-foreground'}`}>{order.advance_status?.toUpperCase() || 'NONE'}</span>
                         </div>
                         {order.payment_proof && (
                           <div>
                             <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-widest">Screenshot</span>
                             <a href={order.payment_proof} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View Proof</a>
                           </div>
                         )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-xs font-body py-4 border-y border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-bold text-[9px] uppercase tracking-widest">Payment:</span>
                        <span className="font-bold uppercase text-gold bg-gold/5 px-2 py-0.5 rounded border border-gold/10">{order.payment_method}</span>
                      </div>
                      {order.discount_code && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-bold text-[9px] uppercase tracking-widest">Discount:</span>
                          <span className="font-medium text-destructive bg-destructive/5 px-2 py-0.5 rounded border border-destructive/10">
                            {order.discount_code} (-{formatPrice(order.discount_amount || 0)})
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase font-heading tracking-widest text-muted-foreground mb-4">Items Summary</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 bg-background border border-border/50 rounded-xl p-3 shadow-sm hover:border-gold/30 transition-colors">
                            <div className="w-12 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                              {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-body font-bold truncate text-foreground/90">{item.product_name}</p>
                              <div className="flex gap-2 mt-1.5">
                                {item.selected_size && (
                                  <span className="text-[9px] font-bold bg-gold/10 text-gold px-2 py-0.5 rounded-full border border-gold/10">SIZE: {item.selected_size}</span>
                                )}
                                <span className="text-[9px] font-medium bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full">QTY: {item.quantity}</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold font-body text-gold">{formatPrice(item.product_price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50">
                      {order.advance_status === 'pending' && order.payment_method !== 'whatsapp_cod' && (
                        <Button 
                          size="sm" 
                          variant="luxury" 
                          onClick={() => verifyPayment(order)}
                          className="h-9 px-5 text-[10px] font-bold tracking-wider"
                        >
                          <CheckCircle size={14} className="mr-2" /> VERIFY PAYMENT
                        </Button>
                      )}
                      {order.advance_status === 'pending' && order.payment_method === 'whatsapp_cod' && (
                        <div className="flex flex-wrap items-center gap-3 w-full bg-green-50/50 p-3 rounded-lg border border-green-200">
                          <Label className="text-xs font-bold text-green-800">Advance Received:</Label>
                          <Input 
                            type="number" 
                            className="w-32 h-9 text-xs" 
                            placeholder="e.g. 500" 
                            value={advanceInputs[order.id] || ''}
                            onChange={(e) => setAdvanceInputs({...advanceInputs, [order.id]: e.target.value})}
                          />
                          <Button 
                            size="sm" 
                            variant="luxury" 
                            onClick={() => {
                              const val = parseFloat(advanceInputs[order.id]);
                              if (!val || val <= 0) return toast.error('Enter a valid amount');
                              verifyPayment(order, val);
                            }}
                            className="h-9 px-5 text-[10px] font-bold tracking-wider ml-auto sm:ml-0"
                          >
                            <CheckCircle size={14} className="mr-2" /> CONFIRM ORDER
                          </Button>
                        </div>
                      )}
                      {order.status === 'pending' && order.advance_status !== 'pending' && (
                        <Button 
                          size="sm" 
                          variant="luxury" 
                          onClick={() => updateStatus(order, 'confirmed')}
                          className="h-9 px-5 text-[10px] font-bold tracking-wider"
                        >
                          <CheckCircle size={14} className="mr-2" /> CONFIRM ORDER
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button 
                          size="sm" 
                          variant="luxury" 
                          onClick={() => updateStatus(order, 'ready_to_ship')}
                          className="h-9 px-5 text-[10px] font-bold tracking-wider"
                        >
                          <Truck size={14} className="mr-2" /> SHIP ORDER
                        </Button>
                      )}
                      {order.status === 'ready_to_ship' && (
                        <Button 
                          size="sm" 
                          variant="luxury" 
                          onClick={() => updateStatus(order, 'delivered')}
                          className="h-9 px-5 text-[10px] font-bold tracking-wider"
                        >
                          <Package size={14} className="mr-2" /> MARK DELIVERED
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-4 border-t border-border mt-4">
              <p className="text-[11px] text-muted-foreground font-body">
                Showing <span className="font-bold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-foreground">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="font-bold text-gold">{totalCount}</span> orders
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-lg"
                  onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo(0, 0); }}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={14} />
                </Button>
                
                <div className="flex items-center gap-1 mx-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                      return (
                        <Button
                          key={p}
                          variant={currentPage === p ? 'luxury' : 'ghost'}
                          size="sm"
                          className={`w-8 h-8 text-[11px] font-bold rounded-lg transition-all ${currentPage === p ? 'shadow-md shadow-gold/20 scale-110' : ''}`}
                          onClick={() => { setCurrentPage(p); window.scrollTo(0, 0); }}
                        >
                          {p}
                        </Button>
                      );
                    } else if (p === currentPage - 2 || p === currentPage + 2) {
                      return <span key={p} className="text-muted-foreground px-1 text-[10px]">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-lg"
                  onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo(0, 0); }}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
