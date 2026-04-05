import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, User } from 'lucide-react';
import { useCart } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const itemCount = useCart((s) => s.itemCount());
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link to="/" className="font-heading text-xl md:text-2xl tracking-[0.2em] uppercase font-bold">
          Luxe
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/collections/men" className="text-xs tracking-widest uppercase font-body font-medium hover:text-gold transition-colors">
            Men
          </Link>
          <Link to="/collections/women" className="text-xs tracking-widest uppercase font-body font-medium hover:text-gold transition-colors">
            Women
          </Link>
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
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gold"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-6 flex flex-col gap-4">
            <Link to="/collections/men" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase font-body font-medium py-2">
              Men
            </Link>
            <Link to="/collections/women" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase font-body font-medium py-2">
              Women
            </Link>
            <Link to="/collections" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase font-body font-medium py-2">
              All Collections
            </Link>
            <Link to={user ? '/dashboard' : '/login'} onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase font-body font-medium py-2">
              {user ? 'My Account' : 'Login'}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
