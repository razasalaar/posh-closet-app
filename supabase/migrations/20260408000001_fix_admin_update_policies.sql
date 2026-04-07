-- Fix UPDATE policy on categories to include WITH CHECK clause
-- (PostgreSQL UPDATE needs both USING and WITH CHECK)
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories" ON public.categories
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix UPDATE policy on products similarly
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix UPDATE policy on product_sizes similarly
DROP POLICY IF EXISTS "Admins can update product sizes" ON public.product_sizes;
CREATE POLICY "Admins can update product sizes" ON public.product_sizes
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
