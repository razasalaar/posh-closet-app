import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart, CartItem } from '@/lib/store';
import { formatPrice } from '@/lib/data';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import LoginPromptDialog from '@/components/layout/LoginPromptDialog';
import { Check, ChevronLeft, CreditCard, Truck, User, ShoppingBag, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

type Step = 1 | 2 | 3;

interface ContactInfo { email: string; phone: string; }
interface ShippingInfo { firstName: string; lastName: string; address: string; city: string; postalCode: string; phone: string; }

const cities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Abbottabad', 'Mardan',
];

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clearCart, setItems } = useCart();
  const cartTotal = total();
  const freeShipping = cartTotal >= 10000;
  const shippingCost = freeShipping ? 0 : 500;
  const finalTotal = cartTotal + shippingCost;

  const [step, setStep] = useState<Step>(1);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'whatsapp_cod' | 'card'>('cod');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [contact, setContact] = useState<ContactInfo>({ email: '', phone: '' });
  const [shipping, setShipping] = useState<ShippingInfo>({ firstName: '', lastName: '', address: '', city: '', postalCode: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [restoringState, setRestoringState] = useState(() => !!localStorage.getItem('checkout_state'));

  useEffect(() => {
    const loadPaymentSettings = async () => {
      const { data } = await supabase.from('payment_settings').select('*').limit(1).maybeSingle();
      if (data) setPaymentSettings(data);
    };
    loadPaymentSettings();
  }, []);

  // Restore checkout state from localStorage (after login redirect)
  useEffect(() => {
    const saved = localStorage.getItem('checkout_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.cartItems && state.cartItems.length > 0) {
          // Only restore cart if current cart is empty
          if (items.length === 0) {
            setItems(state.cartItems);
          }
        }
        if (state.contact) setContact(state.contact);
        if (state.shipping) setShipping(state.shipping);
        if (state.paymentMethod) setPaymentMethod(state.paymentMethod);
        if (state.step) setStep(state.step);
        if (state.discountCode) setDiscountCode(state.discountCode);
        if (state.discountApplied) setDiscountApplied(state.discountApplied);
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
    setRestoringState(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save checkout state to localStorage before login redirect
  const saveCheckoutState = () => {
    const checkoutState = {
      cartItems: items,
      contact,
      shipping,
      paymentMethod,
      step,
      discountCode,
      discountApplied,
    };
    localStorage.setItem('checkout_state', JSON.stringify(checkoutState));
  };

  // Auto-fill email from logged-in account and skip Step 1
  useEffect(() => {
    if (user?.email) {
      setContact((prev) => ({ ...prev, email: user.email! }));
      // Only auto-advance to step 2 if no restored checkout state pushed us further
      setStep((prev) => (prev <= 1 ? 2 : prev));
    }
  }, [user]);

  if (items.length === 0 && !restoringState) {
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
    if (step === 2 && user?.email) return; // logged-in users can't go back to contact step
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const discountAmount = discountApplied ? Math.round(cartTotal * 0.1) : 0;
  const grandTotal = finalTotal - discountAmount;

  const uploadPaymentProof = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { error } = await supabase.storage.from('payment-proofs').upload(fileName, file);
    if (error) {
      toast.error('Failed to upload payment proof');
      return null;
    }
    const { data } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const placeOrder = async () => {
    if (paymentMethod === 'cod' && !paymentProof) {
      toast.error("Please upload the payment screenshot to proceed");
      return;
    }
    
    setPlacing(true);
    try {
      let proofUrl = null;
      if (paymentProof) {
        proofUrl = await uploadPaymentProof(paymentProof);
        if (!proofUrl) {
          setPlacing(false);
          return;
        }
      }

      const currentUser = (await supabase.auth.getUser()).data.user;
      const { data: order, error: orderError } = await supabase.from('orders').insert({
        user_id: currentUser?.id || null,
        email: user?.email || contact.email,
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
        advance_amount: paymentMethod === 'cod' ? 1000 : 0,
        remaining_amount: paymentMethod === 'cod' ? Math.max(0, grandTotal - 1000) : grandTotal,
        payment_proof: proofUrl,
        advance_status: (paymentMethod === 'cod' || paymentMethod === 'whatsapp_cod') ? 'pending' : 'none',
      }).select().single();

      if (orderError || !order) {
        toast.error('Failed to place order. Please try again.');
        setPlacing(false);
        return;
      }

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        product_image: item.product.image_url,
        quantity: item.quantity,
        selected_size: item.selectedSize || null,
      }));
      await supabase.from('order_items').insert(orderItems);

      // Store guest order in localStorage for later account linking
      if (!currentUser) {
        const guestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
        guestOrders.push(order.id);
        localStorage.setItem('guest_orders', JSON.stringify(guestOrders));
      }

      const checkoutItems = items.map(item => ({
        name: item.product.name,
        brand: item.product.brand || 'No Brand',
        size: item.selectedSize || 'Standard',
        qty: item.quantity
      }));

      clearCart();
      // Clear saved checkout state after successful order
      localStorage.removeItem('checkout_state');
      navigate('/order-success', { state: { orderId: order.id, paymentMethod, checkoutItems } });
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
    setPlacing(false);
  };

  const handleCompleteOrder = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    await placeOrder();
  };

  const applyDiscount = () => {
    if (discountCode.toUpperCase() === 'LUXE10') setDiscountApplied(true);
  };

  const stepLabels = [
    { num: 1, label: 'Contact', icon: User },
    { num: 2, label: 'Shipping', icon: Truck },
    { num: 3, label: 'Payment', icon: CreditCard },
  ];

  return (
    <Layout>
      <div className="container py-6 md:py-10 max-w-5xl">
        {/* Step indicator — hide Step 1 if user is logged in; re-number visually */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {stepLabels
            .filter((s) => !(user?.email && s.num === 1))
            .map((s, idx, arr) => {
              const visualNum = idx + 1;
              const isDone = step > s.num;
              const isActive = step >= s.num;
              return (
                <div key={s.num} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {isDone ? <Check size={12} /> : <s.icon size={12} />}
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{visualNum}</span>
                  </div>
                  {idx < arr.length - 1 && <div className={`w-8 md:w-16 h-px ${isDone ? 'bg-primary' : 'bg-border'}`} />}
                </div>
              );
            })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {step > 1 && !user?.email && (
              <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-body transition-colors">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step > 2 && user?.email && (
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-body transition-colors">
                <ChevronLeft size={16} /> Back
              </button>
            )}

            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-heading text-xl tracking-wider">Contact Information</h2>
                <p className="text-sm text-muted-foreground font-body">We'll use this to send you order updates.</p>
                <div className="space-y-3">
                  <div>
                    <Label className="font-body text-xs tracking-wide uppercase">Email</Label>
                    <Input type="email" placeholder="your@email.com" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="mt-1 font-body" />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div className="flex items-center gap-3"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground font-body">or</span><div className="flex-1 h-px bg-border" /></div>
                  <div>
                    <Label className="font-body text-xs tracking-wide uppercase">Phone Number</Label>
                    <Input type="tel" placeholder="+92 3XX XXXXXXX" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="mt-1 font-body" />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                  </div>
                  {errors.contact && <p className="text-xs text-destructive">{errors.contact}</p>}
                </div>
                <Button variant="luxury" size="lg" className="w-full mt-4" onClick={handleNext}>Continue to Shipping</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-heading text-xl tracking-wider">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-body text-xs tracking-wide uppercase">First Name</Label>
                    <Input value={shipping.firstName} onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })} className="mt-1 font-body" />
                    {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label className="font-body text-xs tracking-wide uppercase">Last Name</Label>
                    <Input value={shipping.lastName} onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })} className="mt-1 font-body" />
                    {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <Label className="font-body text-xs tracking-wide uppercase">Address</Label>
                  <Input placeholder="House/Flat no., Street, Area" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} className="mt-1 font-body" />
                  {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-body text-xs tracking-wide uppercase">City</Label>
                    <select value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select city</option>
                      {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label className="font-body text-xs tracking-wide uppercase">Postal Code</Label>
                    <Input placeholder="Optional" value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })} className="mt-1 font-body" />
                  </div>
                </div>
                <div>
                  <Label className="font-body text-xs tracking-wide uppercase">Phone</Label>
                  <Input type="tel" placeholder="+92 3XX XXXXXXX" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} className="mt-1 font-body" />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
                <Button variant="luxury" size="lg" className="w-full mt-4" onClick={handleNext}>Continue to Payment</Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-heading text-xl tracking-wider">Payment Method</h2>
                
                <div className="bg-red-50 border-l-4 border-red-500 p-3.5 rounded-r-lg shadow-sm">
                  <p className="text-sm font-body text-red-800 font-medium">
                    <strong className="font-bold">Notice:</strong> An advance payment is strictly required to combat fake orders and ensure genuine deliveries.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-surface' : 'border-border hover:border-muted-foreground'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-primary" />
                    <div>
                      <p className="font-body font-medium text-sm">Cash on Delivery</p>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed mt-0.5">
                        Rs. 1000 Advance + Remaining on Delivery<br/>
                        <span className="opacity-80">(Upload payment proof directly here on website. If you prefer sending it later, choose the second option below)</span>
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'whatsapp_cod' ? 'border-primary bg-surface' : 'border-border hover:border-muted-foreground'}`}>
                    <input type="radio" name="payment" value="whatsapp_cod" checked={paymentMethod === 'whatsapp_cod'} onChange={() => setPaymentMethod('whatsapp_cod')} className="accent-primary" />
                    <div className="flex items-center gap-2">
                       <MessageCircle size={18} className="text-green-500" />
                       <div>
                         <p className="font-body font-medium text-sm">Cash on Delivery (WhatsApp Confirmation)</p>
                         <p className="font-body text-xs text-muted-foreground mt-0.5">Share your Order ID and payment receipt via WhatsApp to verify and confirm your order.</p>
                       </div>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'whatsapp_cod' && (
                  <div className="bg-green-50/50 p-5 rounded-lg border border-green-200 space-y-4 animate-fade-in shadow-sm">
                     <p className="text-sm font-body text-green-800 font-medium leading-relaxed">
                       Your order will be placed directly. Please contact us on WhatsApp with your <strong className="font-bold">Order ID</strong> and <strong className="font-bold">advance payment receipt</strong> so we can verify and confirm your order.
                     </p>
                  </div>
                )}

                {paymentMethod === 'cod' && paymentSettings && (
                  <div className="bg-muted/50 p-5 rounded-lg border border-border space-y-4 animate-fade-in shadow-sm">
                    <div className="flex justify-between items-center bg-primary/10 text-primary p-3 rounded-md text-sm font-semibold border border-primary/20">
                      <span>Advance Payment Required:</span>
                      <span>Rs. 1000</span>
                    </div>
                    
                    <div className="space-y-3 text-sm font-body text-muted-foreground">
                      <p className="font-medium text-foreground">Please send Rs. 1000 advance to any of the following accounts to confirm your order:</p>
                      
                      <div className="grid gap-3 select-all">
                        {paymentSettings.easypaisa_number && (
                          <div className="bg-background border border-border p-3 rounded-md flex justify-between items-center shadow-sm">
                            <span className="font-semibold text-foreground flex items-center gap-2">Easypaisa</span>
                            <span className="font-mono text-sm">{paymentSettings.easypaisa_number}</span>
                          </div>
                        )}
                        {paymentSettings.jazzcash_number && (
                          <div className="bg-background border border-border p-3 rounded-md flex justify-between items-center shadow-sm">
                            <span className="font-semibold text-foreground flex items-center gap-2">JazzCash</span>
                            <span className="font-mono text-sm">{paymentSettings.jazzcash_number}</span>
                          </div>
                        )}
                        {paymentSettings.bank_name && (
                          <div className="bg-background border border-border p-3 rounded-md space-y-1.5 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-foreground">Bank Name</span>
                              <span>{paymentSettings.bank_name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs">Account Title</span>
                              <span>{paymentSettings.account_title}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs">Account Number</span>
                              <span className="font-mono text-sm">{paymentSettings.account_number}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border mt-4">
                       <Label className="font-body text-xs tracking-wide uppercase font-semibold text-foreground">Upload Payment Screenshot <span className="text-destructive">*</span></Label>
                       <Input type="file" accept="image/*" onChange={(e) => setPaymentProof(e.target.files?.[0] || null)} className="font-body cursor-pointer bg-background" />
                       <p className="text-xs text-muted-foreground">Your order cannot be placed without uploading the payment proof.</p>
                    </div>
                  </div>
                )}
                {/* <div>
                  <Label className="font-body text-xs tracking-wide uppercase">Discount Code</Label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="Enter code" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} className="font-body" disabled={discountApplied} />
                    <Button variant="outline" onClick={applyDiscount} disabled={discountApplied || !discountCode} className="font-body text-xs shrink-0">
                      {discountApplied ? 'Applied ✓' : 'Apply'}
                    </Button>
                  </div>
                  {discountApplied && <p className="text-xs text-gold font-body mt-1">10% discount applied!</p>}
                </div> */}
                <Button variant="luxury" size="lg" className="w-full" onClick={handleCompleteOrder} disabled={placing}>
                  {placing ? 'Placing Order...' : `Complete Order — ${formatPrice(grandTotal)}`}
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-surface rounded-lg p-5 space-y-4 lg:sticky lg:top-24">
              <h3 className="font-heading text-base tracking-wider">Order Summary</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item, idx) => {
                  const img = item.product.image_url || item.product.images?.[0] || '/placeholder.svg';
                  return (
                    <div key={`${item.product.id}_${item.selectedSize || idx}`} className="flex gap-3">
                      <div className="relative w-14 h-16 rounded overflow-hidden flex-shrink-0">
                        <img src={img} alt={item.product.name} className="w-full h-full object-cover" />
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-body font-medium truncate">{item.product.name}</p>
                        <p className="text-[10px] text-muted-foreground font-body">{item.product.brand}</p>
                        {item.selectedSize && <p className="text-[10px] text-gold font-body">Size: {item.selectedSize}</p>}
                        <p className="text-xs font-body font-semibold mt-0.5">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm font-body">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={freeShipping ? 'text-gold font-semibold' : ''}>{freeShipping ? 'FREE' : formatPrice(500)}</span></div>
                {discountApplied && <div className="flex justify-between text-gold"><span>Discount (10%)</span><span>-{formatPrice(discountAmount)}</span></div>}
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-body font-bold text-base">
                <span>Total</span><span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        onSaveCheckoutState={saveCheckoutState}
      />
    </Layout>
  );
};

export default Checkout;
