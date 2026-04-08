-- RPC to fetch current user's orders with items
-- Using SECURITY DEFINER to avoid RLS join issues for customers
CREATE OR REPLACE FUNCTION public.get_my_orders()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id',              o.id,
      'total',           o.total,
      'status',          o.status,
      'payment_method',  o.payment_method,
      'created_at',      o.created_at,
      'order_items',     (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id',            oi.id,
            'product_name',  oi.product_name,
            'product_brand', oi.product_brand,
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
  ), '[]'::jsonb) INTO v_result
  FROM (
    SELECT * FROM public.orders 
    WHERE user_id = v_user_id
    ORDER BY created_at DESC
  ) o;

  RETURN v_result;
END;
$$;
