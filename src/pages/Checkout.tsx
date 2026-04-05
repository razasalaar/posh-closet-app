import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/lib/store';
import { formatPrice } from '@/lib/data';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Check, ChevronLeft, CreditCard, Truck, User, ShoppingBag } from 'lucide-react';

type Step = 1 | 2 | 3;

interface ContactInfo {
  email: string;
  phone: string;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

const cities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Abbottabad', 'Mardan',
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const cartTotal = total();
  const freeShipping = cartTotal >= 10000;
  const shippingCost = freeShipping ? 0 : 500;
  const finalTotal = cartTotal + shippingCost;

  const [step, setStep] = useState<Step>(1);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const [contact, setContact] = useState<ContactInfo>({ email: '', phone: '' });
  const [shipping, setShipping] = useState<ShippingInfo>({
    firstName: '', lastName: '', address: '', city: '', postalCode: '', phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="font-heading text-2xl tracking-wider mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground font-body mb-6">Add some items to proceed to checkout.</p>
          <Button variant="luxury" size="lg" asChild>
            <Link to="/collections">Continue Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!contact.email && !contact.phone) errs.contact = 'Email or phone is required';
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errs.email = 'Invalid email';
    if (contact.phone && !/^(\+92|0)?3\d{9}$/.test(contact.phone.replace(/\s/g, ''))) errs.phone = 'Invalid Pakistani phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!shipping.firstName.trim()) errs.firstName = 'Required';
    if (!shipping.lastName.trim()) errs.lastName = 'Required';
    if (!shipping.address.trim()) errs.address = 'Required';
    if (!shipping.city) errs.city = 'Required';
    if (!shipping.phone.trim()) errs.phone = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleCompleteOrder = async () => {
    const { user } = useAuth;
    // Save order to database
    const { data: order, error } = await supabase.from('orders').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id || null,
      email: contact.email,
      phone: contact.phone || shipping.phone,
      first_name: shipping.firstName,
      last_name: shipping.lastName,
      address: shipping.address,
      city: shipping.city,
      postal_code: shipping.postalCode,
      total: grandTotal,
      payment_method: paymentMethod,
      discount_code: discountApplied ? discountCode : null,
      discount_amount: discountAmount,
    }).select().single();

    if (order) {
      // Save order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: null, // static data products don't have DB ids yet
        product_name: item.product.name,
        product_price: item.product.price,
        product_image: item.product.image,
        quantity: item.quantity,
      }));
      await supabase.from('order_items').insert(orderItems);
    }

    clearCart();
    navigate('/order-success');
  };

  const applyDiscount = () => {
    if (discountCode.toUpperCase() === 'LUXE10') {
      setDiscountApplied(true);
    }
  };

  const discountAmount = discountApplied ? Math.round(cartTotal * 0.1) : 0;
  const grandTotal = finalTotal - discountAmount;

  const stepLabels = [
    { num: 1, label: 'Contact', icon: User },
    { num: 2, label: 'Shipping', icon: Truck },
    { num: 3, label: 'Payment', icon: CreditCard },
  ];

  return (
    <Layout>
      <div className="container py-6 md:py-10 max-w-5xl">
        {/* Progress steps */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {stepLabels.map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors ${
                step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s.num ? <Check size={12} /> : <s.icon size={12} />}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.num}</span>
              </div>
              {idx < stepLabels.length - 1 && (
                <div className={`w-8 md:w-16 h-px ${step > s.num ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form section */}
          <div className="lg:col-span-3 space-y-6">
            {step > 1 && (
              <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-body transition-colors">
                <ChevronLeft size={16} /> Back
              </button>
            )}

            {/* Step 1: Contact */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-heading text-xl tracking-wider">Contact Information</h2>
                <p className="text-sm text-muted-foreground font-body">We'll use this to send you order updates.</p>

                <div className="space-y-3">
                  <div>
                    <Label className="font-body text-xs tracking-wide uppercase">Email</Label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="mt-1 font-body"
                    />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-body">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div>
                    <Label className="font-body text-xs tracking-wide uppercase">Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="+92 3XX XXXXXXX"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      className="mt-1 font-body"
                    />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                  </div>
                  {errors.contact && <p className="text-xs text-destructive">{errors.contact}</p>}
                </div>

                <Button variant="luxury" size="lg" className="w-full mt-4" onClick={handleNext}>
                  Continue to Shipping
                </Button>
              </div>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-heading text-xl tracking-wider">Shipping Address</h2>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-body text-xs tracking-wide uppercase">First Name</Label>
                    <Input
                      value={shipping.firstName}
                      onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })}
                      className="mt-1 font-body"
                    />
                    {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label className="font-body text-xs tracking-wide uppercase">Last Name</Label>
                    <Input
                      value={shipping.lastName}
                      onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
                      className="mt-1 font-body"
                    />
                    {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <Label className="font-body text-xs tracking-wide uppercase">Address</Label>
                  <Input
                    placeholder="House/Flat no., Street, Area"
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    className="mt-1 font-body"
                  />
                  {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-body text-xs tracking-wide uppercase">City</Label>
                    <select
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select city</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label className="font-body text-xs tracking-wide uppercase">Postal Code</Label>
                    <Input
                      placeholder="Optional"
                      value={shipping.postalCode}
                      onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                      className="mt-1 font-body"
                    />
                  </div>
                </div>

                <div>
                  <Label className="font-body text-xs tracking-wide uppercase">Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+92 3XX XXXXXXX"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    className="mt-1 font-body"
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>

                <Button variant="luxury" size="lg" className="w-full mt-4" onClick={handleNext}>
                  Continue to Payment
                </Button>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-heading text-xl tracking-wider">Payment Method</h2>

                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'cod' ? 'border-primary bg-surface' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-primary"
                    />
                    <div>
                      <p className="font-body font-medium text-sm">Cash on Delivery</p>
                      <p className="font-body text-xs text-muted-foreground">Pay when your order arrives</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'card' ? 'border-primary bg-surface' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-primary"
                    />
                    <div>
                      <p className="font-body font-medium text-sm">Card Payment</p>
                      <p className="font-body text-xs text-muted-foreground">Secure payment via Stripe (coming soon)</p>
                    </div>
                  </label>
                </div>

                {/* Discount code */}
                <div>
                  <Label className="font-body text-xs tracking-wide uppercase">Discount Code</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Enter code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="font-body"
                      disabled={discountApplied}
                    />
                    <Button
                      variant="outline"
                      onClick={applyDiscount}
                      disabled={discountApplied || !discountCode}
                      className="font-body text-xs shrink-0"
                    >
                      {discountApplied ? 'Applied ✓' : 'Apply'}
                    </Button>
                  </div>
                  {discountApplied && (
                    <p className="text-xs text-gold font-body mt-1">10% discount applied!</p>
                  )}
                </div>

                <Button variant="luxury" size="lg" className="w-full" onClick={handleCompleteOrder}>
                  Complete Order — {formatPrice(grandTotal)}
                </Button>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-lg p-5 space-y-4 lg:sticky lg:top-24">
              <h3 className="font-heading text-base tracking-wider">Order Summary</h3>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative w-14 h-16 rounded overflow-hidden flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-body font-medium truncate">{item.product.name}</p>
                      <p className="text-[10px] text-muted-foreground font-body">{item.product.brand}</p>
                      <p className="text-xs font-body font-semibold mt-0.5">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 space-y-2 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={freeShipping ? 'text-gold font-semibold' : ''}>{freeShipping ? 'FREE' : formatPrice(500)}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-gold">
                    <span>Discount (10%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-3 flex justify-between font-body font-bold text-base">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
