-- Create SECURITY DEFINER RPC functions for admin category operations
-- These bypass RLS and do the permission check inside the function itself,
-- which is the most reliable approach for admin write operations.

CREATE OR REPLACE FUNCTION public.admin_delete_category(p_category_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'permission denied: admin role required';
  END IF;
  DELETE FROM public.categories WHERE id = p_category_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_product(p_product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'permission denied: admin role required';
  END IF;
  DELETE FROM public.products WHERE id = p_product_id;
END;
$$;
