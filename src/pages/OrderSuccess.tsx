import { Link, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const OrderSuccess = () => {
  const location = useLocation();
  const { orderId, paymentMethod, checkoutItems } = location.state || {};
  const shortOrderId = orderId ? orderId.slice(0, 8).toUpperCase() : '';

  const handleCopy = () => {
    if (shortOrderId) {
      navigator.clipboard.writeText(shortOrderId);
      toast.success("Order ID copied to clipboard!");
    }
  };

  const itemListText = checkoutItems 
    ? checkoutItems.map((item: any) => `- ${item.qty}x ${item.brand} - ${item.name} (Size: ${item.size})`).join('\n')
    : '';

  const rawMessage = `Hello! This is my Order ID: #${shortOrderId}.
${itemListText ? `\nMy order details:\n${itemListText}\n\n` : ''}How much advance payment should I send to confirm this order so it can be ready to ship?`;

  const whatsappMessage = encodeURIComponent(rawMessage);
  const whatsappNumber = "923262500066"; // Updated actual WhatsApp number

  return (
    <Layout>
      <div className="container py-20 text-center max-w-lg mx-auto">
        <div className="animate-fade-in space-y-6">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
            <CheckCircle size={40} className="text-gold" />
          </div>

          <h1 className="font-heading text-3xl tracking-wider">Order Confirmed!</h1>
          <p className="text-muted-foreground font-body">
            Thank you for your purchase. We'll send you an update when your order ships.
          </p>

          {paymentMethod === 'whatsapp_cod' && orderId && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-left space-y-5 animate-fade-in shadow-sm">
              <div className="space-y-1">
                <h3 className="font-heading text-green-900 text-lg">Action Required</h3>
                <p className="text-sm font-body text-green-800">
                  Click the button below to confirm your order — your order details will be automatically sent via WhatsApp.
                </p>
              </div>

              <Button 
                className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white py-6 flex items-center justify-center gap-2" 
                asChild
              >
                <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">
                  <MessageCircle size={22} />
                  <span>Confirm on WhatsApp</span>
                  <span className="ml-1">→</span>
                </a>
              </Button>
            </div>
          )}

          {paymentMethod !== 'whatsapp_cod' && (
            <div className="bg-surface rounded-lg p-6 text-left space-y-3">
              <div className="flex items-center gap-2 text-sm font-body">
                <Package size={16} className="text-gold" />
                <span className="font-medium">Order Status: <span className="text-gold">Pending</span></span>
              </div>
              <p className="text-xs text-muted-foreground font-body">
                You can track your order status in your account dashboard.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button variant="luxury" size="lg" asChild>
              <Link to="/collections">Continue Shopping</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="font-body">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccess;
