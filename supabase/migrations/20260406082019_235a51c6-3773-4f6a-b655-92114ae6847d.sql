
-- Add size_type to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_type text;

-- Create product_sizes table
CREATE TABLE IF NOT EXISTS public.product_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size_label text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, size_label)
);

ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product sizes" ON public.product_sizes
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert product sizes" ON public.product_sizes
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update product sizes" ON public.product_sizes
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete product sizes" ON public.product_sizes
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Add selected_size to order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_size text;
