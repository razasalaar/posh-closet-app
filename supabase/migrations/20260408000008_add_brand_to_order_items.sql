-- Add product_brand to order_items for better order history
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_brand text DEFAULT 'LUXE';
