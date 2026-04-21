import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/lib/store';
import { formatPrice } from '@/lib/data';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckoutAuthSection, LoggedInBadge } from '@/components/layout/CheckoutAuthSection';
import { ChevronDown, ChevronUp, MessageCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/lib/store';

interface ShippingInfo {
  firstName: string; lastName: string; address: string;
  city: string; postalCode: string; phone: string;
}

const CITIES = [
  'Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad',
  'Multan','Peshawar','Quetta','Sialkot','Gujranwala',
  'Hyderabad','Bahawalpur','Sargodha','Abbottabad','Mardan',
];

const LS_KEY = 'checkout_form_v2';

const loadSaved = (): Partial<ShippingInfo> => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
};

// ─── ORDER SUMMARY (outside Checkout to prevent remounting) ───────────────────
interface OrderSummaryProps {
  items: ReturnType<typeof useCart>['items'];
  cartTotal: number;
  shippingCost: number;
  grandTotal: number;
}

const OrderSummary = ({ items, cartTotal, shippingCost, grandTotal }: OrderSummaryProps) => (
  <div className="rounded-xl p-5 space-y-4 backdrop-blur-md bg-white/40 border border-gold/20 shadow-[0_8px_32px_rgba(184,142,62,0.08)]">
    <h3 className="font-heading text-base tracking-wider">Order Summary ({items.length})</h3>
    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
      {items.map((item, idx) => {
        const img = item.product.image_url || (item.product as any).images?.[0] || '/placeholder.svg';
        return (
          <div key={`${item.product.id}_${idx}`} className="flex gap-3">
            <div className="relative w-14 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img src={img} alt={item.product.name} className="w-full h-full object-cover" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{item.quantity}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-body font-medium truncate">{item.product.name}</p>
              <p className="text-[10px] text-muted-foreground font-body">{(item.product as any).brand}</p>
              {item.selectedSize && <p className="text-[10px] text-gold font-body">Size: {item.selectedSize}</p>}
              <p className="text-xs font-body font-semibold mt-0.5">{formatPrice(item.product.price * item.quantity)}</p>
            </div>
          </div>
        );
      })}
    </div>
    <div className="border-t border-border pt-3 space-y-2 text-sm font-body">
      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Shipping</span>
        <span className={shippingCost === 0 ? 'text-gold font-semibold' : ''}>{shippingCost === 0 ? 'FREE' : formatPrice(500)}</span>
      </div>
    </div>
    <div className="border-t border-border pt-3 flex justify-between font-body font-bold text-base">
      <span>Total</span><span>{formatPrice(grandTotal)}</span>
    </div>
  </div>
);

// ─── SHIPPING SECTION (outside Checkout to prevent remounting) ────────────────
interface ShippingSectionProps {
  shipping: ShippingInfo;
  errors: Record<string, string>;
  isLoggedIn: boolean;
  onChange: (key: keyof ShippingInfo, value: string) => void;
  onContinue: () => void;
}

const ShippingSection = ({ shipping, errors, isLoggedIn, onChange, onContinue }: ShippingSectionProps) => (
  <div className="border border-gold/30 rounded-xl overflow-hidden">
    <div className="flex items-center gap-3 bg-gradient-to-r from-[hsl(43,72%,48%)] to-[hsl(36,70%,52%)] text-white px-5 py-4">
      <span className="w-7 h-7 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-sm font-bold text-white">{isLoggedIn ? '1' : '2'}</span>
      <span className="font-heading text-lg tracking-wider">Shipping</span>
    </div>
    <div className="p-5 space-y-4 bg-background">
      <div className="grid grid-cols-2 gap-3">
        {/* First Name */}
        <div>
          <Label className="font-body text-xs tracking-widest uppercase">First Name<span className="text-destructive ml-0.5">*</span></Label>
          <Input
            value={shipping.firstName}
            onChange={e => onChange('firstName', e.target.value)}
            placeholder=""
            className="mt-1 font-body"
          />
          {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
        </div>
        {/* Last Name */}
        <div>
          <Label className="font-body text-xs tracking-widest uppercase">Last Name<span className="text-destructive ml-0.5">*</span></Label>
          <Input
            value={shipping.lastName}
            onChange={e => onChange('lastName', e.target.value)}
            placeholder=""
            className="mt-1 font-body"
          />
          {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
        </div>
      </div>
      {/* Address */}
      <div>
        <Label className="font-body text-xs tracking-widest uppercase">Address<span className="text-destructive ml-0.5">*</span></Label>
        <Input
          value={shipping.address}
          onChange={e => onChange('address', e.target.value)}
          placeholder="House/Flat no., Street, Area"
          className="mt-1 font-body"
        />
        {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* City */}
        <div>
          <Label className="font-body text-xs tracking-widest uppercase">City <span className="text-destructive">*</span></Label>
          <select
            value={shipping.city}
            onChange={e => onChange('city', e.target.value)}
            className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select city</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
        </div>
        {/* Postal Code */}
        <div>
          <Label className="font-body text-xs tracking-widest uppercase">Postal Code</Label>
          <Input
            value={shipping.postalCode}
            onChange={e => onChange('postalCode', e.target.value)}
            placeholder="Optional"
            className="mt-1 font-body"
          />
        </div>
      </div>
      {/* Phone */}
      <div>
        <Label className="font-body text-xs tracking-widest uppercase">Phone<span className="text-destructive ml-0.5">*</span></Label>
        <Input
          value={shipping.phone}
          onChange={e => onChange('phone', e.target.value)}
          placeholder="+92 3XX XXXXXXX"
          className="mt-1 font-body"
        />
        {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
      </div>
      <Button
        id="checkout-continue-payment"
        size="lg"
        className="w-full mt-2 bg-gradient-to-r from-[hsl(43,72%,48%)] to-[hsl(36,70%,52%)] hover:from-[hsl(43,72%,42%)] hover:to-[hsl(36,70%,46%)] text-white font-body tracking-widest border-0 shadow-md hover:shadow-lg transition-all duration-200"
        onClick={onContinue}
      >
        CONTINUE TO PAYMENT
      </Button>
    </div>
  </div>
);

// ─── PAYMENT SECTION (outside Checkout to prevent remounting) ─────────────────
interface PaymentSectionProps {
  shipping: ShippingInfo;
  grandTotal: number;
  placing: boolean;
  isLoggedIn: boolean;
  onEditShipping: () => void;
  onPlaceOrder: () => void;
}

const PaymentSection = ({ shipping, grandTotal, placing, isLoggedIn, onEditShipping, onPlaceOrder }: PaymentSectionProps) => (
  <div className="border border-gold/30 rounded-xl overflow-hidden">
    <div className="flex items-center gap-3 bg-gradient-to-r from-[hsl(43,72%,48%)] to-[hsl(36,70%,52%)] text-white px-5 py-4">
      <span className="w-7 h-7 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-sm font-bold text-white">{isLoggedIn ? '2' : '3'}</span>
      <span className="font-heading text-lg tracking-wider">Payment</span>
    </div>
    <div className="p-5 space-y-4 bg-background">
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-lg">
        <p className="text-sm font-body text-amber-800"><strong>Notice:</strong> Advance payment is required to confirm genuine orders.</p>
      </div>
      <label className="flex items-center gap-3 p-4 border border-primary rounded-lg bg-surface cursor-pointer">
        <input type="radio" checked readOnly className="accent-primary" />
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-green-500" />
          <div>
            <p className="font-body font-medium text-sm">Cash on Delivery (WhatsApp Confirmation)</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">Send Rs. 500–1,000 advance via WhatsApp to confirm your order.</p>
          </div>
        </div>
      </label>

      {/* Shipping summary */}
      <div className="bg-[#f5f0e8] rounded-lg p-4 text-sm font-body space-y-1">
        <p className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-2">Delivering to</p>
        <p className="font-medium">{shipping.firstName} {shipping.lastName}</p>
        <p className="text-muted-foreground">{shipping.address}, {shipping.city}</p>
        <p className="text-muted-foreground">{shipping.phone}</p>
        <button onClick={onEditShipping} className="text-xs underline text-primary mt-1">Edit</button>
      </div>

      <Button
        id="checkout-place-order"
        size="lg"
        className="w-full bg-gradient-to-r from-[hsl(43,72%,48%)] to-[hsl(36,70%,52%)] hover:from-[hsl(43,72%,42%)] hover:to-[hsl(36,70%,46%)] text-white font-body tracking-widest border-0 shadow-md hover:shadow-lg transition-all duration-200"
        onClick={onPlaceOrder}
        disabled={placing}
      >
        {placing ? <><Loader2 size={16} className="animate-spin mr-2" />Placing Order...</> : `COMPLETE ORDER — ${formatPrice(grandTotal)}`}
      </Button>
    </div>
  </div>
);

// ─── LOCKED PLACEHOLDER (outside Checkout to prevent remounting) ──────────────
const LockedSection = ({ num, label }: { num: number; label: string }) => (
  <div className="border border-gold/10 rounded-xl px-5 py-4 flex items-center gap-3 opacity-40 bg-muted/10">
    <span className="w-7 h-7 rounded-full border-2 border-gold/30 flex items-center justify-center text-sm font-bold text-gold/50">{num}</span>
    <span className="font-heading text-base tracking-wider text-muted-foreground">{label}</span>
  </div>
);

// ─── MAIN CHECKOUT COMPONENT ──────────────────────────────────────────────────
const Checkout = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { items, total, clearCart } = useCart();

  const cartTotal = total();
  const shippingCost = cartTotal >= 10000 ? 0 : 500;
  const grandTotal = cartTotal + shippingCost;

  const saved = loadSaved();
  const [shipping, setShipping] = useState<ShippingInfo>({
    firstName: saved.firstName || '',
    lastName: saved.lastName || '',
    address: saved.address || '',
    city: saved.city || '',
    postalCode: saved.postalCode || '',
    phone: saved.phone || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [paymentMethod] = useState<'whatsapp_cod'>('whatsapp_cod');
  const [placing, setPlacing] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Stable handler — won't cause ShippingSection to remount
  const handleFieldChange = (key: keyof ShippingInfo, value: string) => {
    setShipping(p => ({ ...p, [key]: value }));
  };

  // Persist form to localStorage on change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(shipping));
  }, [shipping]);

  useEffect(() => {
    // payment_settings fetch (kept for potential future use)
  }, []);

  const validateShipping = () => {
    const errs: Record<string, string> = {};
    if (!shipping.firstName.trim()) errs.firstName = 'Required';
    if (!shipping.lastName.trim()) errs.lastName = 'Required';
    if (!shipping.address.trim()) errs.address = 'Required';
    if (!shipping.city) errs.city = 'Required';
    if (!shipping.phone.trim()) errs.phone = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      const { data: order, error } = await supabase.from('orders').insert({
        user_id: currentUser?.id || null,
        email: user?.email || '',
        phone: shipping.phone,
        first_name: shipping.firstName,
        last_name: shipping.lastName,
        address: shipping.address,
        city: shipping.city,
        postal_code: shipping.postalCode,
        total: grandTotal,
        payment_method: paymentMethod,
        advance_amount: 0,
        remaining_amount: grandTotal,
        advance_status: 'pending',
      }).select().single();

      if (error || !order) { toast.error('Failed to place order. Try again.'); setPlacing(false); return; }

      await supabase.from('order_items').insert(
        items.map(item => ({
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_price: item.product.price,
          product_image: item.product.image_url,
          quantity: item.quantity,
          selected_size: item.selectedSize || null,
        }))
      );

      const checkoutItems = items.map(i => ({ name: i.product.name, brand: i.product.brand || '', size: i.selectedSize || 'Standard', qty: i.quantity }));
      clearCart();
      navigate('/order-success', { state: { orderId: order.id, paymentMethod, checkoutItems } });
    } catch {
      toast.error('Something went wrong.');
    }
    setPlacing(false);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center max-w-md mx-auto">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="font-heading text-2xl tracking-wider mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground font-body mb-6">Add items to your cart to continue.</p>
          <Button variant="luxury" size="lg" asChild>
            <Link to="/collections">Continue Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <div className="border-b border-border">
          <div className="container max-w-5xl py-4 flex items-center justify-between">
            <Link to="/" className="font-heading text-xl tracking-[0.2em] bg-gradient-to-r from-[hsl(43,72%,48%)] to-[hsl(36,70%,52%)] bg-clip-text text-transparent font-bold">MANSA MUSSA</Link>
            <Link to="/cart" className="font-body text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              ← Edit Bag
            </Link>
          </div>
        </div>

        <div className="container max-w-5xl py-6 md:py-10">
          {/* Mobile order summary toggle */}
          <button
            id="checkout-summary-toggle"
            onClick={() => setSummaryOpen(o => !o)}
            className="lg:hidden w-full flex items-center justify-between border border-border rounded-xl px-5 py-3 mb-6 font-body text-sm bg-[#f5f0e8]"
          >
            <span className="font-medium">Order Summary ({items.length})</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{formatPrice(grandTotal)}</span>
              {summaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>
          {summaryOpen && (
            <div className="lg:hidden mb-6">
              <OrderSummary items={items} cartTotal={cartTotal} shippingCost={shippingCost} grandTotal={grandTotal} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* LEFT: form */}
            <div className="lg:col-span-3 space-y-4">
              {!user ? (
                /* ── Guest: show auth section ── */
                <CheckoutAuthSection
                  onLoginSuccess={() => { /* useAuth will update user state automatically */ }}
                  savedEmail=""
                />
              ) : (
                /* ── Logged in: badge → shipping/payment ── */
                <>
                  <LoggedInBadge email={user.email!} onSignOut={signOut} />

                  {step === 'shipping' && (
                    <ShippingSection
                      shipping={shipping}
                      errors={errors}
                      isLoggedIn={!!user}
                      onChange={handleFieldChange}
                      onContinue={() => { if (validateShipping()) setStep('payment'); }}
                    />
                  )}
                  {step === 'shipping' && <LockedSection num={2} label="Payment" />}

                  {step === 'payment' && (
                    <>
                      {/* Collapsed shipping */}
                      <div className="border border-gold/30 rounded-xl px-5 py-4 flex items-center justify-between bg-gradient-to-r from-[hsl(43,72%,97%)] to-[hsl(36,70%,97%)]">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-gold text-white flex items-center justify-center text-sm font-bold">✓</span>
                          <span className="font-heading text-base tracking-wider">Shipping</span>
                        </div>
                        <button onClick={() => setStep('shipping')} className="text-xs font-body underline text-muted-foreground">Edit</button>
                      </div>
                      <PaymentSection
                        shipping={shipping}
                        grandTotal={grandTotal}
                        placing={placing}
                        isLoggedIn={!!user}
                        onEditShipping={() => setStep('shipping')}
                        onPlaceOrder={placeOrder}
                      />
                    </>
                  )}
                </>
              )}
            </div>

            {/* RIGHT: order summary (desktop) */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="sticky top-24">
                <OrderSummary items={items} cartTotal={cartTotal} shippingCost={shippingCost} grandTotal={grandTotal} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
