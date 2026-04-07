-- Fix orders INSERT policy to allow both authenticated and guest (anon) users
-- Drop the old policy that only allowed authenticated users
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;

-- Create a new policy that allows anyone (including guests) to insert orders
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Fix order_items INSERT policy similarly
DROP POLICY IF EXISTS "Authenticated users can create order items" ON public.order_items;

-- Create a new policy that allows anyone (including guests) to insert order items
CREATE POLICY "Anyone can create order items" ON public.order_items
  FOR INSERT WITH CHECK (true);
