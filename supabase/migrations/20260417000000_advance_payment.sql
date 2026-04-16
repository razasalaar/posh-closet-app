-- Create payment settings table
CREATE TABLE public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  easypaisa_number TEXT,
  jazzcash_number TEXT,
  bank_name TEXT,
  account_title TEXT,
  account_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payment settings" ON public.payment_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert payment settings" ON public.payment_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update payment settings" ON public.payment_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete payment settings" ON public.payment_settings FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_payment_settings_updated_at BEFORE UPDATE ON public.payment_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row
INSERT INTO public.payment_settings (easypaisa_number, jazzcash_number, bank_name, account_title, account_number)
VALUES ('', '', '', '', '');

-- Update orders table
ALTER TABLE public.orders 
ADD COLUMN advance_amount NUMERIC DEFAULT 0,
ADD COLUMN remaining_amount NUMERIC DEFAULT 0,
ADD COLUMN payment_proof TEXT,
ADD COLUMN advance_status TEXT DEFAULT 'none';

-- Storage for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view payment proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs');
CREATE POLICY "Anyone can upload payment proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');
CREATE POLICY "Admins can update payment proofs" ON storage.objects FOR UPDATE USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete payment proofs" ON storage.objects FOR DELETE USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));
