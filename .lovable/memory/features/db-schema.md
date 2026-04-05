---
name: Database schema
description: Full eCommerce schema with profiles, user_roles, categories, products, orders, order_items
type: feature
---
Tables: profiles (user_id, full_name, phone), user_roles (user_id, role enum admin/user), categories (name, type men/women), products (name, brand, price, category_id, image_url, images[], description, rating, reviews, is_featured), orders (user_id, email, phone, first/last name, address, city, postal_code, total, status enum, payment_method, discount_code/amount), order_items (order_id, product_id, product_name, product_price, product_image, quantity).
Storage: product-images bucket (public read, admin write).
Triggers: auto-create profile + user role on signup, auto-update updated_at.
RLS: public read on products/categories, user own data on profiles/orders, admin full access via has_role().
