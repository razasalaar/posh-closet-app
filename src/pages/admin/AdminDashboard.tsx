import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';
import { Package, ShoppingBag, FolderOpen, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [prodRes, catRes, ordRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total'),
      ]);
      const revenue = (ordRes.data || []).reduce((s, o) => s + Number(o.total), 0);
      setStats({
        products: prodRes.count || 0,
        categories: catRes.count || 0,
        orders: (ordRes.data || []).length,
        revenue,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Products', value: stats.products, icon: ShoppingBag, color: 'text-blue-500' },
    { label: 'Categories', value: stats.categories, icon: FolderOpen, color: 'text-purple-500' },
    { label: 'Orders', value: stats.orders, icon: Package, color: 'text-green-500' },
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: 'text-gold' },
  ];

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl tracking-wider mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <c.icon size={18} className={c.color} />
              <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">{c.label}</span>
            </div>
            <p className="text-2xl font-body font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
