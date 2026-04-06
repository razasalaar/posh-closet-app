import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { Product, useCart, useWishlist } from '@/lib/store';
import { formatPrice } from '@/lib/data';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const addToCart = useCart((s) => s.addToCart);
  const toggleWishlist = useWishlist((s) => s.toggleWishlist);
  const isInWishlist = useWishlist((s) => s.isInWishlist(product.id));

  const mainImage = product.image_url || product.images?.[0] || '/placeholder.svg';

  return (
    <div className="group animate-fade-in">
      <div className="relative overflow-hidden rounded-lg bg-surface aspect-[3/4]">
        <Link to={`/product/${product.id}`}>
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart size={16} className={isInWishlist ? 'fill-gold text-gold' : ''} />
        </button>
        {!product.size_type && (
          <button
            onClick={() => addToCart(product)}
            className="absolute bottom-3 right-3 p-2.5 rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold"
            aria-label="Add to cart"
          >
            <ShoppingBag size={16} />
          </button>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-body">
          {product.brand}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-body font-medium hover:text-gold transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm font-body font-semibold">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
