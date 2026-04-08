-- Trigger to automatically notify admins when a new order is placed
-- This runs on the server (SECURITY DEFINER), so it bypasses RLS and always works!

CREATE OR REPLACE FUNCTION public.notify_admins_of_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a notification for every admin
  INSERT INTO public.notifications (user_id, type, title, message, order_id)
  SELECT 
    user_id,
    'new_order',
    'New Order Received! 🛍️',
    NEW.first_name || ' ' || NEW.last_name || ' placed an order of RS. ' || NEW.total,
    NEW.id
  FROM public.user_roles
  WHERE role = 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clear previous trigger if it exists
DROP TRIGGER IF EXISTS on_order_created ON public.orders;

-- Create the trigger
CREATE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_of_new_order();
