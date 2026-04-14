import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Package, ShoppingBag, FolderOpen, LayoutDashboard, ArrowLeft } from 'lucide-react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/login');
  }, [user, isAdmin, loading, navigate]);

  if (loading) return <div className="flex items-center justify-center min-h-screen font-body">Loading...</div>;
  if (!user || !isAdmin) return null;

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products', icon: ShoppingBag },
    { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { to: '/admin/orders', label: 'Orders', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs text-muted-foreground font-body flex items-center gap-1 hover:text-foreground">
              <ArrowLeft size={14} /> Store
            </Link>
            <span className="font-heading text-lg tracking-wider">Mansa Mussa Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex gap-1">
              {links.map((l) => {
                const active = location.pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-body font-medium transition-colors ${
                      active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <l.icon size={14} />
                    <span className="hidden sm:inline">{l.label}</span>
                  </Link>
                );
              })}
            </nav>
            <NotificationBell isAdmin />
          </div>
        </div>
      </div>
      <div className="container py-6">{children}</div>
    </div>
  );
};

export default AdminLayout;
