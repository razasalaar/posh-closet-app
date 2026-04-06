import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/store';
import { formatPrice } from '@/lib/data';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const cartTotal = total();
  const freeShipping = cartTotal >= 10000;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="font-heading text-2xl tracking-wider mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground font-body mb-6">Looks like you haven't added anything yet.</p>
          <Button variant="luxury" size="lg" asChild>
            <Link to="/collections">Continue Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="font-heading text-3xl tracking-wider mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, idx) => {
              const mainImage = item.product.image_url || item.product.images?.[0] || '/placeholder.svg';
              return (
                <div key={`${item.product.id}_${item.selectedSize || idx}`} className="flex gap-4 p-4 border border-border rounded-lg">
                  <Link to={`/product/${item.product.id}`} className="w-20 h-24 rounded-md overflow-hidden flex-shrink-0">
                    <img src={mainImage} alt={item.product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-body">{item.product.brand}</p>
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="text-sm font-body font-medium truncate">{item.product.name}</h3>
                    </Link>
                    {item.selectedSize && (
                      <p className="text-xs font-body text-gold mt-0.5">Size: {item.selectedSize}</p>
                    )}
                    <p className="text-sm font-body font-semibold mt-1">{formatPrice(item.product.price)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border rounded-md">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)} className="p-1.5 hover:bg-surface">
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm font-body">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)} className="p-1.5 hover:bg-surface">
                          <Plus size={12} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id, item.selectedSize)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-surface rounded-lg p-6 h-fit space-y-4 lg:sticky lg:top-32">
            <h3 className="font-heading text-lg tracking-wider">Order Summary</h3>
            <div className="space-y-2 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={freeShipping ? 'text-gold font-semibold' : ''}>{freeShipping ? 'FREE' : formatPrice(500)}</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-body font-bold">
              <span>Total</span>
              <span>{formatPrice(freeShipping ? cartTotal : cartTotal + 500)}</span>
            </div>
            {!freeShipping && (
              <p className="text-xs text-gold font-body text-center">
                Add {formatPrice(10000 - cartTotal)} more for free shipping!
              </p>
            )}
            <Button variant="luxury" size="lg" className="w-full" asChild>
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
