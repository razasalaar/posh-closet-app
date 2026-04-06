import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, User, ChevronDown, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  type: string;
}

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [hoverType, setHoverType] = useState<string | null>(null);
  const itemCount = useCart((s) => s.itemCount());
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  const menCategories = categories.filter((c) => c.type === 'men');
  const womenCategories = categories.filter((c) => c.type === 'women');

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="font-heading text-xl md:text-2xl tracking-[0.2em] uppercase font-bold">Luxe</Link>

        {/* Desktop Nav with hover dropdowns */}
        <nav className="hidden lg:flex items-center gap-8">
          <div className="relative" onMouseEnter={() => setHoverType('men')} onMouseLeave={() => setHoverType(null)}>
            <Link to="/collections/men" className="text-xs tracking-widest uppercase font-body font-medium hover:text-gold transition-colors flex items-center gap-1">
              Men <ChevronDown size={12} />
            </Link>
            {hoverType === 'men' && menCategories.length > 0 && (
              <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg py-2 min-w-[160px] z-50">
                {menCategories.map((cat) => (
                  <Link key={cat.id} to={`/collections/men?category=${cat.id}`} className="block px-4 py-2 text-xs tracking-wider uppercase font-body hover:bg-surface hover:text-gold transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="relative" onMouseEnter={() => setHoverType('women')} onMouseLeave={() => setHoverType(null)}>
            <Link to="/collections/women" className="text-xs tracking-widest uppercase font-body font-medium hover:text-gold transition-colors flex items-center gap-1">
              Women <ChevronDown size={12} />
            </Link>
            {hoverType === 'women' && womenCategories.length > 0 && (
              <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg py-2 min-w-[160px] z-50">
                {womenCategories.map((cat) => (
                  <Link key={cat.id} to={`/collections/women?category=${cat.id}`} className="block px-4 py-2 text-xs tracking-wider uppercase font-body hover:bg-surface hover:text-gold transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link to="/collections" className="text-xs tracking-widest uppercase font-body font-medium hover:text-gold transition-colors">
            Collections
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:text-gold transition-colors" aria-label="Search">
            <Search size={18} />
          </button>
          <Link to="/wishlist" className="p-2 hover:text-gold transition-colors" aria-label="Wishlist">
            <Heart size={18} />
          </Link>
          <Link to="/cart" className="p-2 hover:text-gold transition-colors relative" aria-label="Cart">
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold text-accent-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <Link to={user ? '/dashboard' : '/login'} className="p-2 hover:text-gold transition-colors hidden md:block" aria-label="Account">
            <User size={18} />
          </Link>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-border p-4 animate-fade-in">
          <div className="container">
            <input type="text" placeholder="Search products..." className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gold" autoFocus />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-6 flex flex-col gap-1">
            {/* Men with expandable subcategories */}
            <div>
              <button
                onClick={() => setExpandedType(expandedType === 'men' ? null : 'men')}
                className="flex items-center justify-between w-full text-sm tracking-widest uppercase font-body font-medium py-3"
              >
                <span>Men</span>
                {expandedType === 'men' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expandedType === 'men' && (
                <div className="pl-4 pb-2 space-y-1">
                  <Link to="/collections/men" onClick={() => setMenuOpen(false)} className="block text-xs tracking-wider uppercase font-body text-muted-foreground py-2 hover:text-gold">
                    All Men
                  </Link>
                  {menCategories.map((cat) => (
                    <Link key={cat.id} to={`/collections/men?category=${cat.id}`} onClick={() => setMenuOpen(false)} className="block text-xs tracking-wider uppercase font-body text-muted-foreground py-2 hover:text-gold">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Women with expandable subcategories */}
            <div>
              <button
                onClick={() => setExpandedType(expandedType === 'women' ? null : 'women')}
                className="flex items-center justify-between w-full text-sm tracking-widest uppercase font-body font-medium py-3"
              >
                <span>Women</span>
                {expandedType === 'women' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expandedType === 'women' && (
                <div className="pl-4 pb-2 space-y-1">
                  <Link to="/collections/women" onClick={() => setMenuOpen(false)} className="block text-xs tracking-wider uppercase font-body text-muted-foreground py-2 hover:text-gold">
                    All Women
                  </Link>
                  {womenCategories.map((cat) => (
                    <Link key={cat.id} to={`/collections/women?category=${cat.id}`} onClick={() => setMenuOpen(false)} className="block text-xs tracking-wider uppercase font-body text-muted-foreground py-2 hover:text-gold">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/collections" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase font-body font-medium py-3">
              All Collections
            </Link>
            <Link to={user ? '/dashboard' : '/login'} onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase font-body font-medium py-3">
              {user ? 'My Account' : 'Login'}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
