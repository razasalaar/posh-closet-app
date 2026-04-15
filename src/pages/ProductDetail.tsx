import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/data';
import { useCart, useWishlist, Product } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { Star, ShoppingBag, Heart, Shield, Truck, Minus, Plus, ChevronLeft, ChevronRight, Eye, Zap, XCircle } from 'lucide-react';
import { usePageSeo } from '@/hooks/usePageSeo';
import ReviewForm from '@/components/product/ReviewForm';
import ReviewList from '@/components/product/ReviewList';

interface SizeInfo {
  size_label: string;
  quantity: number;
}

const SHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const TROUSER_SIZES = ['30', '32', '34', '36', '38', '40'];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [sizes, setSizes] = useState<SizeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [viewerCount] = useState(() => Math.floor(Math.random() * 500) + 800);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const navigate = useNavigate();
  const addToCart = useCart((s) => s.addToCart);
  const buyNow = useCart((s) => s.buyNow);
  const toggleWishlist = useWishlist((s) => s.toggleWishlist);
  const isInWishlist = useWishlist((s) => (product ? s.isInWishlist(product.id) : false));
  const allImages = [product?.image_url, ...(product?.images || [])].filter(Boolean) as string[];
  const displayImages = allImages.length > 0 ? [...new Set(allImages)] : ['/placeholder.svg'];
  const productType = product?.categories?.name || "premium clothing";

  usePageSeo({
    title: product
      ? `${product.name} - ${productType} | Mansa Mussa Pakistan`
      : "Premium Clothing Product | Mansa Mussa Pakistan",
    description: product
      ? `Buy ${product.name} online in Pakistan. Premium ${productType.toLowerCase()} with modern minimalist style, luxury comfort, and nationwide delivery by Mansa Mussa.`
      : "Shop premium men and women clothing online in Pakistan at Mansa Mussa.",
    path: product ? `/product/${product.id}` : "/collections",
    image: displayImages[0],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, categories(name, type)')
        .eq('id', id!)
        .single();
      if (data) {
        setProduct(data as any);
        // Fetch sizes
        if (data.size_type) {
          const { data: sizeData } = await supabase
            .from('product_sizes')
            .select('size_label, quantity')
            .eq('product_id', data.id);
          setSizes(sizeData || []);
        }
      }
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return <Layout><div className="container py-20 text-center font-body">Loading...</div></Layout>;
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-heading text-2xl">Product not found</h1>
          <Link to="/collections" className="text-gold underline mt-4 inline-block font-body">Back to collections</Link>
        </div>
      </Layout>
    );
  }

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % displayImages.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);

  const hasSizes = !!product.size_type && sizes.length > 0;
  const sizeLabels = product.size_type === 'shirt' ? SHIRT_SIZES : product.size_type === 'trouser' ? TROUSER_SIZES : [];

  const getSizeQty = (label: string) => {
    const s = sizes.find((sz) => sz.size_label === label);
    return s ? s.quantity : 0;
  };

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(product, quantity, selectedSize || undefined);
  };

  const handleBuyNow = () => {
    if (hasSizes && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    buyNow(product, quantity, selectedSize || undefined);
    navigate('/checkout');
  };

  return (
    <Layout>
      <div className="container py-6 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-body text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/collections" className="hover:text-foreground">Collections</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Image Slider */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-surface">
              <img src={displayImages[currentImage]} alt={product.name} className="w-full h-full object-cover" />
              {displayImages.length > 1 && (
                <>
                  <button aria-label="Previous product image" title="Previous product image" onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background">
                    <ChevronLeft size={18} />
                  </button>
                  <button aria-label="Next product image" title="Next product image" onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-16 h-20 rounded-md overflow-hidden border-2 transition-colors ${i === currentImage ? 'border-gold' : 'border-transparent'}`}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground font-body mb-1">{product.brand}</p>
              <h1 className="font-heading text-2xl md:text-3xl tracking-wider">{product.name}</h1>
            </div>

            <p className="text-2xl font-body font-bold">{formatPrice(product.price)}</p>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < Math.floor(product.rating || 0) ? 'fill-gold text-gold' : 'text-border'} />
                ))}
              </div>
              <span className="text-sm font-body text-muted-foreground">({product.reviews || 0} reviews)</span>
            </div>

            {/* Live viewers */}
            <div className="flex items-center gap-2 text-sm font-body">
              <Eye size={16} className="text-gold animate-pulse-soft" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{viewerCount.toLocaleString()}</span> people are viewing right now
              </span>
            </div>

            {/* Free shipping bar */}
            <div className="bg-gold-light rounded-lg px-4 py-3">
              <p className="text-xs tracking-widest uppercase font-body font-semibold text-center">🚚 Free Shipping Over Rs. 10,000</p>
            </div>

            {/* Trust badges */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                <Shield size={16} className="text-gold" /> Secure Payments
              </div>
              <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                <Truck size={16} className="text-gold" /> Fast Shipping
              </div>
            </div>

            {/* Size Selection */}
            {hasSizes && (
              <div className="space-y-3">
                <p className="text-xs tracking-widest uppercase font-body text-muted-foreground">
                  Select Size {product.size_type === 'shirt' ? '(Shirt)' : '(Trouser)'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizeLabels.map((label) => {
                    const qty = getSizeQty(label);
                    const outOfStock = qty === 0;
                    const isSelected = selectedSize === label;
                    return (
                      <button
                        key={label}
                        disabled={outOfStock}
                        onClick={() => { setSelectedSize(label); setSizeError(false); }}
                        className={`relative min-w-[3rem] px-3 py-2 rounded-lg border text-sm font-body font-medium transition-all
                          ${isSelected ? 'border-gold bg-gold/10 text-gold' : outOfStock ? 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50' : 'border-border hover:border-gold'}`}
                      >
                        {label}
                        {outOfStock && (
                          <XCircle size={14} className="absolute -top-1 -right-1 text-destructive" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedSize && (
                  <p className="text-xs font-body text-muted-foreground">
                    {getSizeQty(selectedSize)} in stock
                  </p>
                )}
                {sizeError && (
                  <p className="text-xs text-destructive font-body">Please select a size</p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <p className="text-xs tracking-widest uppercase font-body text-muted-foreground">Quantity</p>
              <div className="flex items-center border border-border rounded-lg w-fit">
                <button aria-label="Decrease quantity" title="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-surface transition-colors">
                  <Minus size={14} />
                </button>
                <span className="px-5 py-3 font-body text-sm font-medium min-w-[3rem] text-center">{quantity}</span>
                <button aria-label="Increase quantity" title="Increase quantity" onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-surface transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button variant="luxury" size="lg" className="flex-1" onClick={handleAddToCart}>
                  <ShoppingBag size={16} /> Add to Cart
                </Button>
                <Button variant="luxury-outline" size="lg" onClick={() => toggleWishlist(product)}>
                  <Heart size={16} className={isInWishlist ? 'fill-gold text-gold' : ''} />
                </Button>
              </div>
              <Button variant="luxury" size="lg" className="w-full bg-gold hover:bg-gold/90 text-background" onClick={handleBuyNow}>
                <Zap size={16} /> Buy It Now
              </Button>
            </div>

            {/* Description */}
            <div className="pt-6 border-t border-border">
              <h2 className="text-xs tracking-widest uppercase font-body font-semibold mb-3">Product Details</h2>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="pt-2">
              <h3 className="text-xs tracking-widest uppercase font-body font-semibold mb-2">Shop More</h3>
              <div className="flex flex-wrap gap-3 text-xs font-body">
                <Link to="/collections/men" className="underline underline-offset-4 hover:text-gold">Men Collection</Link>
                <Link to="/collections/women" className="underline underline-offset-4 hover:text-gold">Women Collection</Link>
                <Link to="/collections" className="underline underline-offset-4 hover:text-gold">All Collections</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky add to cart */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border p-4 space-y-2">
        <Button variant="luxury" size="lg" className="w-full" onClick={handleAddToCart}>
          <ShoppingBag size={16} /> Add to Cart — {formatPrice(product.price * quantity)}
        </Button>
        <Button variant="luxury" size="lg" className="w-full bg-gold hover:bg-gold/90 text-background" onClick={handleBuyNow}>
          <Zap size={16} /> Buy It Now
        </Button>
      </div>
    </Layout>
  );
};

export default ProductDetail;
