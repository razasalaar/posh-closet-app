import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import heroBanner from '@/assets/hero-banner.jpg';
import type { Product } from '@/lib/store';
import { ImageOff } from 'lucide-react';
import { usePageSeo } from '@/hooks/usePageSeo';
import { ProductGridSkeleton } from '@/components/product/ProductCardSkeleton';

interface CategoryWithImage {
  id: string;
  name: string;
  type: 'men' | 'women';
  representative_image: string | null;
}

const Index = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithImage[]>([]);
  const [loading, setLoading] = useState(true);

  usePageSeo({
    title: "Mansa Mussa | Premium Men & Women Clothing Pakistan",
    description:
      "Shop premium men and women clothing in Pakistan at Mansa Mussa. Discover minimalist luxury shirts, trousers, lawn and suits with nationwide delivery.",
    path: "/",
  });

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*, categories(name, type)').eq('is_featured', true).limit(8),
        // Fetch from the new view that includes representative images
        supabase.from('categories_with_images' as never).select('*').order('name'),
      ]);
      setFeatured((prodRes.data ?? []) as Product[]);
      setCategories((catRes.data ?? []) as CategoryWithImage[]);
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
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          poster={heroBanner}
          className="w-full h-full object-cover object-center"
        >
          {/* Add your own premium video URL or local file path in the src below */}
          <source src="bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl text-white font-bold tracking-wider text-center leading-tight drop-shadow-lg">
            WEAR<br /> THE SEASON
          </h1>
        </div>
      </section>

      {/* Scrollable Category Cards with Dynamic Images */}
      {categories.length > 0 && (
        <section className="py-8 bg-surface/30">
          <div className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide">
            {[...menCats, ...womenCats].map((cat) => (
              <Link
                key={cat.id}
                to={`/collections/${cat.type}?category=${cat.id}`}
                className="flex-shrink-0 w-32 md:w-40 group"
              >
                <div className="relative aspect-square rounded-2xl bg-muted overflow-hidden border border-border group-hover:border-gold/30 group-hover:shadow-lg transition-all duration-300">
                  {cat.representative_image ? (
                    <img 
                      src={cat.representative_image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-muted/50">
                      <ImageOff size={24} className="text-muted-foreground/30 mb-2" />
                      <span className="text-[8px] md:text-[9px] text-muted-foreground uppercase font-body leading-tight">No product image available</span>
                    </div>
                  )}
                  
                  {/* Category Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-4">
                    <span className="text-[10px] md:text-xs tracking-[0.15em] uppercase font-body font-bold text-white drop-shadow-sm">
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
        <section className="container py-12 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-xl md:text-2xl tracking-wider uppercase">Featured Style</h2>
            <Link to="/collections" className="text-[10px] tracking-widest uppercase font-body font-bold text-gold hover:text-foreground transition-colors py-1 border-b-2 border-gold/30 hover:border-foreground">
              Explore All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="container pb-12 md:pb-16">
        <h2 className="font-heading text-xl md:text-2xl tracking-wider uppercase mb-4">
          Online Clothing Store Pakistan
        </h2>
        <p className="text-sm md:text-base text-muted-foreground font-body leading-relaxed max-w-3xl">
          Mansa Mussa is a premium online clothing store in Pakistan for men and women who prefer
          modern, minimal, and luxury style. Explore men shirts, trousers, pants, suits, shalwar
          kameez, and women lawn, linen, dresses, and suits designed for Pakistani seasons.
        </p>
      </section>

      {/* Minimal Promo */}
      <section className="bg-surface relative overflow-hidden">
        <div className="container py-16 md:py-24 text-center relative z-10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold font-body font-bold mb-3">Service Excellence</p>
          <h2 className="font-heading text-3xl md:text-5xl tracking-tight mb-4">Free Shipping Nationwide</h2>
          <p className="text-muted-foreground font-body text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed">
            Experience luxury at your doorstep. Complimentary shipping on all orders above <span className="text-foreground font-bold italic">Rs. 10,000</span>.
          </p>
          <Link to="/collections" className="inline-block bg-foreground text-background px-10 py-4 text-xs tracking-[0.2em] uppercase font-body font-bold hover:bg-gold hover:text-accent-foreground transition-all hover:scale-105 active:scale-95 duration-300 shadow-xl">
            Shop The Collection
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/5 rounded-full blur-3xl -ml-24 -mb-24" />
      </section>
    </Layout>
  );
};

export default Index;
