import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { useWishlist } from '@/lib/store';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Wishlist = () => {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="font-heading text-2xl tracking-wider mb-2">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground font-body mb-6">Save items you love for later.</p>
          <Button variant="luxury" size="lg" asChild>
            <Link to="/collections">Browse Collections</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="font-heading text-3xl tracking-wider mb-8">Wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
