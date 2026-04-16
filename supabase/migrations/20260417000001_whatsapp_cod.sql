-- Migration for WhatsApp COD feature
-- No schema changes are required because:
-- 1. `payment_method` is a TEXT column that can accept 'whatsapp_cod'.
-- 2. `advance_amount`, `remaining_amount`, and `advance_status` are already present in the `orders` table.

-- This file is created to document the addition of the WhatsApp COD logic.
SELECT 1;
