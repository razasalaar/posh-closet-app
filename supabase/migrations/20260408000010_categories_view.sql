-- View to get categories with their latest product image
CREATE OR REPLACE VIEW public.categories_with_images AS
SELECT 
  c.id,
  c.name,
  c.type,
  c.created_at,
  (
    SELECT p.image_url 
    FROM public.products p 
    WHERE p.category_id = c.id 
    ORDER BY p.created_at DESC 
    LIMIT 1
  ) as representative_image
FROM public.categories c;

-- Ensure everyone can view this view
ALTER VIEW public.categories_with_images OWNER TO postgres;
GRANT SELECT ON public.categories_with_images TO anon, authenticated;
