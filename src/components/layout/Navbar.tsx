import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, User, ChevronDown, ChevronRight, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart, useWishlist } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import NotificationBell from '@/components/notifications/NotificationBell';
import logoIcon from '@/assets/logo-icon.png';

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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const itemCount = useCart((s) => s.itemCount());
  const wishlistCount = useWishlist((s) => s.items.length);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Derive user info
  const isGoogleUser = user?.app_metadata?.provider === 'google';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'My Account';
  const userEmail = user?.email || '';

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const menCategories = categories.filter((c) => c.type === 'men');
  const womenCategories = categories.filter((c) => c.type === 'women');

  const handleDropdownEnter = (type: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(type);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 200);
  };

  const handleSignOut = async () => {
    setProfileOpen(false);
    await signOut();
    navigate('/');
  };

  const UserAvatar = ({ size = 32 }: { size?: number }) => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={displayName}
          referrerPolicy="no-referrer"
          style={{ width: size, height: size }}
          className="rounded-full object-cover ring-2 ring-gold/30 hover:ring-gold transition-all"
        />
      );
    }
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-gold/20 flex items-center justify-center ring-2 ring-gold/30 hover:ring-gold transition-all"
      >
        <span className="text-gold font-body font-semibold text-xs">
          {displayName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-1">
          <button className="lg:hidden p-1.5" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-0">
            <img src={logoIcon} alt="Mansa Mussa" className="h-24 md:h-26 w-auto" />
            <h1 className='text-yellow-600 text-md -ml-12 md:text-2xl '>MANSA MUSSA</h1>
          </Link>
        </div>

        {/* Desktop Nav with click-toggle dropdowns */}
        <nav className="hidden lg:flex items-center gap-8 -ml-16">
          <div
            className="relative"
            onMouseEnter={() => handleDropdownEnter('men')}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              onClick={() => setOpenDropdown(openDropdown === 'men' ? null : 'men')}
              className="text-xs tracking-widest uppercase font-body font-medium hover:text-gold transition-colors flex items-center gap-1"
            >
              Men <ChevronDown size={12} className={`transition-transform ${openDropdown === 'men' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'men' && (
              <div
                className="absolute top-full left-0 pt-2 z-50"
                onMouseEnter={() => handleDropdownEnter('men')}
                onMouseLeave={handleDropdownLeave}
              >
                <div className="bg-background border border-border rounded-lg shadow-lg py-2 min-w-[180px]">
                  <Link to="/collections/men" onClick={() => setOpenDropdown(null)} className="block px-4 py-2.5 text-xs tracking-wider uppercase font-body font-medium hover:bg-surface hover:text-gold transition-colors">
                    All Men
                  </Link>
                  {menCategories.map((cat) => (
                    <Link key={cat.id} to={`/collections/men?category=${cat.id}`} onClick={() => setOpenDropdown(null)} className="block px-4 py-2.5 text-xs tracking-wider uppercase font-body hover:bg-surface hover:text-gold transition-colors">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div
            className="relative"
            onMouseEnter={() => handleDropdownEnter('women')}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              onClick={() => setOpenDropdown(openDropdown === 'women' ? null : 'women')}
              className="text-xs tracking-widest uppercase font-body font-medium hover:text-gold transition-colors flex items-center gap-1"
            >
              Women <ChevronDown size={12} className={`transition-transform ${openDropdown === 'women' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'women' && (
              <div
                className="absolute top-full left-0 pt-2 z-50"
                onMouseEnter={() => handleDropdownEnter('women')}
                onMouseLeave={handleDropdownLeave}
              >
                <div className="bg-background border border-border rounded-lg shadow-lg py-2 min-w-[180px]">
                  <Link to="/collections/women" onClick={() => setOpenDropdown(null)} className="block px-4 py-2.5 text-xs tracking-wider uppercase font-body font-medium hover:bg-surface hover:text-gold transition-colors">
                    All Women
                  </Link>
                  {womenCategories.map((cat) => (
                    <Link key={cat.id} to={`/collections/women?category=${cat.id}`} onClick={() => setOpenDropdown(null)} className="block px-4 py-2.5 text-xs tracking-wider uppercase font-body hover:bg-surface hover:text-gold transition-colors">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link to="/collections" className="text-xs tracking-widest uppercase font-body font-medium hover:text-gold transition-colors">
            Collections
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-0.5">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-1.5 hover:text-gold transition-colors" aria-label="Search">
            <Search size={18} />
          </button>

          {/* Cart */}
          <Link to="/cart" className="p-1.5 hover:text-gold transition-colors relative" aria-label="Cart">
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold text-accent-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Notification Bell */}
          {user && <NotificationBell />}

          {/* Wishlist icon (desktop) */}
          <Link to="/wishlist" className="p-1.5 hover:text-gold transition-colors relative hidden lg:flex" aria-label="Wishlist">
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold text-accent-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Account - profile or icon */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="p-1 hover:opacity-90 transition-opacity flex items-center"
                aria-label="Account"
              >
                <UserAvatar size={30} />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                  {/* User info header */}
                  <div className="px-4 py-4 bg-surface border-b border-border flex items-center gap-3">
                    <UserAvatar size={44} />
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-sm truncate">{displayName}</p>
                      {userEmail && (
                        <p className="font-body text-xs text-muted-foreground truncate">{userEmail}</p>
                      )}
                      {isGoogleUser && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-body text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                          <svg width="10" height="10" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                          Google Account
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-body hover:bg-surface hover:text-gold transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      My Account
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-body hover:bg-surface hover:text-gold transition-colors"
                    >
                      <Heart size={16} />
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto text-xs bg-gold/20 text-gold font-medium px-1.5 py-0.5 rounded-full">{wishlistCount}</span>
                      )}
                    </Link>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-body text-destructive hover:bg-destructive/5 transition-colors w-full text-left"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="p-1.5 hover:text-gold transition-colors" aria-label="Account">
              <User size={18} />
            </Link>
          )}
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
          {/* Mobile user profile strip */}
          {user && (
            <div className="border-b border-border px-4 py-4 flex items-center gap-3 bg-surface">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/30" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center ring-2 ring-gold/30">
                  <span className="text-gold font-body font-semibold">{displayName.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div>
                <p className="font-body font-semibold text-sm">{displayName}</p>
                {userEmail && <p className="font-body text-xs text-muted-foreground">{userEmail}</p>}
              </div>
            </div>
          )}

          <nav className="container py-6 flex flex-col gap-1">
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

            {/* Wishlist in mobile menu - text only */}
            <Link
              to="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between text-sm tracking-widest uppercase font-body font-medium py-3"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="text-xs bg-gold text-background font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>
              )}
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase font-body font-medium py-3">
                  My Account
                </Link>
                <button
                  onClick={async () => { setMenuOpen(false); await signOut(); navigate('/'); }}
                  className="text-left text-sm tracking-widest uppercase font-body font-medium py-3 text-destructive"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase font-body font-medium py-3">
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
