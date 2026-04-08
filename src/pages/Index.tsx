import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import heroBanner from '@/assets/hero-banner.jpg';
import type { Product } from '@/lib/store';

const Index = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*, categories(name, type)').eq('is_featured', true).limit(8),
        supabase.from('categories').select('*').order('name'),
      ]);
      setFeatured((prodRes.data as any[]) || []);
      setCategories(catRes.data || []);
    };
    fetchData();
  }, []);

  const menCats = categories.filter((c) => c.type === 'men');
  const womenCats = categories.filter((c) => c.type === 'women');

  return (
    <Layout>
      {/* Category Tabs - Outfitters style */}
      <div className="flex items-center justify-center gap-8 py-3 border-b border-border bg-background">
        <Link to="/collections/men" className="text-xs tracking-[0.2em] uppercase font-body font-bold hover:text-gold transition-colors">
          Men
        </Link>
        <Link to="/collections/women" className="text-xs tracking-[0.2em] uppercase font-body font-bold hover:text-gold transition-colors">
          Women
        </Link>
      </div>

      {/* Hero - Full screen clean like Outfitters */}
      <section className="relative h-[85vh] md:h-[90vh] overflow-hidden">
        <img
          src={heroBanner}
          alt="Summer collection"
          className="w-full h-full object-cover object-top"
          width={1280}
          height={1600}
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl text-white font-bold tracking-wider text-center leading-tight drop-shadow-lg">
            SUMMER<br />ESSENTIALS
          </h1>
        </div>
      </section>

      {/* Scrollable Category Cards */}
      {menCats.length + womenCats.length > 0 && (
        <section className="py-6">
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {[...menCats, ...womenCats].map((cat) => (
              <Link
                key={cat.id}
                to={`/collections/${cat.type}?category=${cat.id}`}
                className="flex-shrink-0 w-28 md:w-36"
              >
                <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-b from-muted to-border flex items-end justify-center pb-3">
                    <span className="text-[10px] md:text-xs tracking-widest uppercase font-body font-bold text-foreground">
                      {cat.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="container pb-12 md:pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl md:text-2xl tracking-wider">Featured</h2>
            <Link to="/collections" className="text-[10px] tracking-widest uppercase font-body font-medium text-muted-foreground hover:text-gold transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Minimal Promo */}
      <section className="bg-surface">
        <div className="container py-12 md:py-20 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-body font-semibold mb-2">Exclusive</p>
          <h2 className="font-heading text-2xl md:text-4xl tracking-wider mb-3">Free Shipping Nationwide</h2>
          <p className="text-muted-foreground font-body text-sm max-w-md mx-auto mb-6">On all orders above Rs. 10,000</p>
          <Link to="/collections" className="inline-block bg-foreground text-background px-8 py-3 text-xs tracking-widest uppercase font-body font-bold hover:bg-gold hover:text-accent-foreground transition-colors">
            Shop Now
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
