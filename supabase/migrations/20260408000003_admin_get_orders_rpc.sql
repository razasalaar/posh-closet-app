-- Admin RPC to fetch all orders with their items (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.admin_get_orders()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'permission denied: admin role required';
  END IF;

  RETURN (
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
      ORDER BY o.created_at DESC
    ), '[]'::jsonb)
    FROM public.orders o
  );
END;
$$;
