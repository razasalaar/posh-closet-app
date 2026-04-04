import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package } from 'lucide-react';

const OrderSuccess = () => {
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

          <div className="bg-surface rounded-lg p-6 text-left space-y-3">
            <div className="flex items-center gap-2 text-sm font-body">
              <Package size={16} className="text-gold" />
              <span className="font-medium">Order Status: <span className="text-gold">Pending</span></span>
            </div>
            <p className="text-xs text-muted-foreground font-body">
              You can track your order status in your account dashboard once the backend is connected.
            </p>
          </div>

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
