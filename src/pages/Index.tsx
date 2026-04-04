import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/data';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const featured = products.slice(0, 8);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&h=900&fit=crop"
          alt="Luxury fashion collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/20 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-16 md:pb-24">
          <div className="container">
            <div className="max-w-lg animate-slide-up">
              <p className="text-xs tracking-[0.3em] uppercase text-primary-foreground/80 font-body mb-3">
                New Season 2026
              </p>
              <h1 className="font-heading text-4xl md:text-6xl text-primary-foreground font-bold leading-tight mb-6">
                Elevate Your Style
              </h1>
              <div className="flex gap-3">
                <Button variant="luxury" size="lg" asChild className="bg-background text-foreground hover:bg-gold hover:text-accent-foreground">
                  <Link to="/collections">Shop Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16 md:py-24">
        <h2 className="font-heading text-2xl md:text-3xl text-center tracking-wider mb-12">
          Shop By Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/collections/men" className="group relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=600&fit=crop"
              alt="Men's collection"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/40 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h3 className="font-heading text-3xl md:text-4xl text-primary-foreground tracking-wider">Men</h3>
                <p className="text-xs tracking-widest uppercase text-primary-foreground/80 font-body mt-2 flex items-center gap-2 justify-center">
                  Explore <ArrowRight size={14} />
                </p>
              </div>
            </div>
          </Link>
          <Link to="/collections/women" className="group relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=600&fit=crop"
              alt="Women's collection"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/40 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h3 className="font-heading text-3xl md:text-4xl text-primary-foreground tracking-wider">Women</h3>
                <p className="text-xs tracking-widest uppercase text-primary-foreground/80 font-body mt-2 flex items-center gap-2 justify-center">
                  Explore <ArrowRight size={14} />
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container pb-16 md:pb-24">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-heading text-2xl md:text-3xl tracking-wider">Featured</h2>
          <Link to="/collections" className="text-xs tracking-widest uppercase font-body font-medium text-muted-foreground hover:text-gold transition-colors flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-surface">
        <div className="container py-16 md:py-24 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gold font-body font-semibold mb-3">
            Exclusive Offer
          </p>
          <h2 className="font-heading text-3xl md:text-5xl tracking-wider mb-4">
            Free Shipping Nationwide
          </h2>
          <p className="text-muted-foreground font-body max-w-md mx-auto mb-8">
            On all orders above Rs. 10,000. Premium packaging and fast delivery across Pakistan.
          </p>
          <Button variant="luxury" size="lg" asChild>
            <Link to="/collections">Shop Collection</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
