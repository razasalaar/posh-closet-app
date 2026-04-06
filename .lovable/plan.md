

# Plan: Dynamic Supabase Integration + Size System + UI Enhancements

## Overview
Replace all static data with dynamic Supabase queries, add a size/quantity inventory system, enhance the admin panel, improve the mobile menu with dynamic category dropdowns, and support multi-image product galleries.

---

## Database Migration (New SQL file)

A new migration file will be created at `supabase/migrations/` with:

1. **`product_sizes` table** -- stores size variants per product
   - `id` (uuid, PK)
   - `product_id` (uuid, FK to products)
   - `size_type` (text: 'shirt' or 'trouser' or null)
   - `size_label` (text: e.g. 'S', 'M', 'L', '32', '34')
   - `quantity` (integer, default 0)
   - `created_at` (timestamptz)

2. **Add `size_type` column to `products`** -- nullable text column ('shirt', 'trouser', or null for no sizes)

3. **Add `selected_size` column to `order_items`** -- nullable text to record which size was ordered

4. **RLS policies on `product_sizes`**: public read, admin insert/update/delete

You will run this SQL manually in your Supabase SQL Editor.

---

## Step-by-Step Changes

### 1. Dynamic Data from Supabase

**Files changed:** `src/pages/Index.tsx`, `src/pages/Collections.tsx`, `src/pages/ProductDetail.tsx`, `src/components/product/ProductCard.tsx`, `src/lib/store.ts`, `src/lib/data.ts`

- Remove all static product/category arrays from `data.ts` (keep only `formatPrice`)
- Update `Product` interface in `store.ts` to match DB schema (use `image_url` instead of `image`, add `category_id`, `size_type`)
- Update `CartItem` to include `selectedSize?: string`
- **Index.tsx**: Fetch featured products (`is_featured = true`) and categories from Supabase on mount
- **Collections.tsx**: Fetch products with category join from Supabase, filter by category type (men/women) using the joined category
- **ProductDetail.tsx**: Fetch single product by ID from Supabase, fetch its sizes from `product_sizes`
- **ProductCard.tsx**: Update to use `image_url` field

### 2. Size Selection System (Frontend)

**Files changed:** `src/pages/ProductDetail.tsx`, `src/lib/store.ts`

- If product has `size_type`, show size selector buttons on ProductDetail page
- Shirt sizes: S, M, L, XL, XXL, XXXL
- Trouser sizes: 30, 32, 34, 36, 38, 40
- Each size button shows quantity; if quantity = 0, show with a cross/strikethrough and disable it
- User must select a size before adding to cart (validation)
- `addToCart` and `buyNow` accept optional `selectedSize` parameter
- Selected size is stored in `CartItem` and displayed in Cart page

### 3. Admin Panel -- Size Management

**Files changed:** `src/pages/admin/AdminProducts.tsx`

- Add "Size Type" selector in product form with options: None, Shirts, Trousers
- When Shirts selected: show input fields for S/M/L/XL/XXL/XXXL quantities
- When Trousers selected: show input fields for 30/32/34/36/38/40 quantities
- On save: insert/update rows in `product_sizes` table alongside the product
- On edit: load existing sizes from `product_sizes`

### 4. Admin Panel -- Multi-Image Upload

**Files changed:** `src/pages/admin/AdminProducts.tsx`

- Change image upload to support 1 main image + up to 3 additional images
- Upload all to `product-images` storage bucket
- Save main as `image_url`, all 4 as `images[]` array
- Show image previews in the form

### 5. Order Items with Size Tracking

**Files changed:** `src/pages/Checkout.tsx`, `src/pages/admin/AdminOrders.tsx`, `src/pages/Dashboard.tsx`

- Checkout: save `selected_size` in each `order_item` when creating order
- Also save `product_id` (now using real DB UUIDs)
- AdminOrders: display the selected size next to each order item
- Dashboard: show size in order history

### 6. Mobile Menu with Dynamic Category Dropdown

**Files changed:** `src/components/layout/Navbar.tsx`

- Fetch categories from Supabase on mount
- Group by type (men/women)
- In mobile menu: show "Men" and "Women" as expandable sections
- On tap: reveal subcategories (e.g. Shirts, Trousers, Suits)
- Each subcategory links to `/collections/men?category=<id>` or similar
- Desktop nav: add hover dropdowns for Men/Women with subcategories

### 7. Collections Page -- Query String Filtering

**Files changed:** `src/pages/Collections.tsx`

- Read `?category=<id>` from URL to pre-filter
- Fetch products from Supabase with optional category filter
- Categories fetched dynamically, not from static data

---

## Technical Details

### Migration SQL (to be saved as a file for you to run)
```sql
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
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update product sizes" ON public.product_sizes
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete product sizes" ON public.product_sizes
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Add selected_size to order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_size text;
```

### Updated Product interface
```typescript
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category_id: string | null;
  image_url: string | null;
  images: string[] | null;
  description: string | null;
  rating: number | null;
  reviews: number | null;
  is_featured: boolean | null;
  size_type: string | null;
  categories?: { name: string; type: string };
}
```

### Files Summary

| File | Action |
|------|--------|
| `supabase/migrations/new_migration.sql` | Create -- sizes table, new columns |
| `src/lib/data.ts` | Simplify -- remove static data, keep `formatPrice` |
| `src/lib/store.ts` | Update -- new Product type, `selectedSize` in CartItem |
| `src/pages/Index.tsx` | Rewrite -- fetch from Supabase |
| `src/pages/Collections.tsx` | Rewrite -- dynamic data + URL filtering |
| `src/pages/ProductDetail.tsx` | Rewrite -- dynamic fetch + size selector |
| `src/pages/Cart.tsx` | Update -- show selected size |
| `src/pages/Checkout.tsx` | Update -- save size + real product_id |
| `src/pages/Dashboard.tsx` | Update -- show size in orders |
| `src/components/product/ProductCard.tsx` | Update -- use `image_url` |
| `src/components/layout/Navbar.tsx` | Rewrite -- dynamic categories dropdown |
| `src/pages/admin/AdminProducts.tsx` | Enhance -- size inputs + multi-image |
| `src/pages/admin/AdminOrders.tsx` | Update -- show size column |
| `src/integrations/supabase/types.ts` | Update -- add product_sizes table type + new columns |

