-- 1. Fix order_items RLS to ensure admins can see them clearly
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" ON public.order_items 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  ));

-- 2. Fix notifications RLS to ensure admins can see and delete them
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  ));

-- 3. Ensure the RPC for admin orders is fully updated and robust
CREATE OR REPLACE FUNCTION public.admin_get_orders(
  p_limit INT DEFAULT 10,
  p_offset INT DEFAULT 0,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to ensure admin sees everything
SET search_path = public
AS $$
DECLARE
  v_total_count BIGINT;
  v_orders_json JSONB;
BEGIN
  -- Get total count matching filters
  SELECT count(*) INTO v_total_count
  FROM public.orders o
  WHERE (p_start_date IS NULL OR o.created_at >= p_start_date)
    AND (p_end_date IS NULL OR o.created_at <= p_end_date);

  -- Get paginated orders
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id',              o.id,
      'user_id',         o.user_id,
      'email',           o.email,
      'phone',           o.phone,
      'first_name',      o.first_name,
      'last_name',       o.last_name,
      'address',         o.address,
      'city',            o.city,
      'postal_code',     o.postal_code,
      'total',           o.total,
      'status',          o.status,
      'payment_method',  o.payment_method,
      'discount_code',   o.discount_code,
      'discount_amount', o.discount_amount,
      'created_at',      o.created_at,
      'updated_at',      o.updated_at,
      'order_items',     (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id',            oi.id,
            'product_id',    oi.product_id,
            'product_name',  oi.product_name,
            'product_price', oi.product_price,
            'product_image', oi.product_image,
            'quantity',      oi.quantity,
            'selected_size', oi.selected_size
          )
        ), '[]'::jsonb)
        FROM public.order_items oi
        WHERE oi.order_id = o.id
      )
    )
  ), '[]'::jsonb) INTO v_orders_json
  FROM (
    SELECT * FROM public.orders o
    WHERE (p_start_date IS NULL OR o.created_at >= p_start_date)
      AND (p_end_date IS NULL OR o.created_at <= p_end_date)
    ORDER BY o.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) o;

  RETURN jsonb_build_object(
    'total_count', v_total_count,
    'orders', v_orders_json
  );
END;
$$;
