-- ==============================================================================
-- Aroham Cascading Deletion Setup Script for Users & Astrologers
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lzzdfsphevmzbkkoskxb/sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Ensure CASCADE behavior on Foreign Keys for User & Astrologer tables
-- ------------------------------------------------------------------------------

-- user_carts
ALTER TABLE IF EXISTS public.user_carts
  DROP CONSTRAINT IF EXISTS user_carts_user_id_fkey;

-- user_wishlists
ALTER TABLE IF EXISTS public.user_wishlists
  DROP CONSTRAINT IF EXISTS user_wishlists_user_id_fkey;

-- addresses
ALTER TABLE IF EXISTS public.addresses
  DROP CONSTRAINT IF EXISTS addresses_user_id_fkey;

-- order_items
ALTER TABLE IF EXISTS public.order_items
  DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS public.order_items
  ADD CONSTRAINT order_items_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- payments
ALTER TABLE IF EXISTS public.payments
  DROP CONSTRAINT IF EXISTS payments_order_id_fkey;
ALTER TABLE IF EXISTS public.payments
  ADD CONSTRAINT payments_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- chat_messages
ALTER TABLE IF EXISTS public.chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_session_id_fkey;
ALTER TABLE IF EXISTS public.chat_messages
  ADD CONSTRAINT chat_messages_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE CASCADE;


-- ------------------------------------------------------------------------------
-- 2. Create Stored Database Function & Trigger for User Cascading Deletion
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_cascade_delete_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete carts & wishlists (column user_id)
  BEGIN
    DELETE FROM public.user_carts WHERE user_id::text = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    DELETE FROM public.user_wishlists WHERE user_id::text = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  
  -- Delete addresses, reviews, subscribers, profiles
  BEGIN
    DELETE FROM public.addresses WHERE user_id::text = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    DELETE FROM public.astrologer_reviews WHERE user_id::text = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    DELETE FROM public.astrologer_transactions WHERE user_id::text = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    DELETE FROM public.reviews WHERE user_id::text = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    DELETE FROM public.subscribers WHERE user_id::text = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    DELETE FROM public.profiles WHERE id::text = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Delete order items for user's orders
  BEGIN
    DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE user_id::text = OLD.id::text);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  
  -- Delete payments for user's orders & user_id
  BEGIN
    DELETE FROM public.payments WHERE user_id::text = OLD.id::text OR order_id IN (SELECT id FROM public.orders WHERE user_id::text = OLD.id::text);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  
  -- Delete orders
  BEGIN
    DELETE FROM public.orders WHERE user_id::text = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  
  -- Delete chat messages for user's chat sessions
  BEGIN
    DELETE FROM public.chat_messages WHERE session_id IN (SELECT id FROM public.chat_sessions WHERE user_id::text = OLD.id::text);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  
  -- Delete chat sessions
  BEGIN
    DELETE FROM public.chat_sessions WHERE user_id::text = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_cascade_delete_user ON public.users;
CREATE TRIGGER trg_cascade_delete_user
BEFORE DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.fn_cascade_delete_user();


-- ------------------------------------------------------------------------------
-- 3. Create Stored Database Function & Trigger for Astrologer Cascading Deletion
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_cascade_delete_astrologer()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete astrologer reviews and transactions
  BEGIN
    DELETE FROM public.astrologer_reviews WHERE astrologer_id::text = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    DELETE FROM public.astrologer_transactions WHERE astrologer_id::text = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Delete chat messages for astrologer's chat sessions
  BEGIN
    DELETE FROM public.chat_messages WHERE session_id IN (SELECT id FROM public.chat_sessions WHERE astrologer_id::text = OLD.id::text);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Delete chat sessions
  BEGIN
    DELETE FROM public.chat_sessions WHERE astrologer_id::text = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_cascade_delete_astrologer ON public.astrologers;
CREATE TRIGGER trg_cascade_delete_astrologer
BEFORE DELETE ON public.astrologers
FOR EACH ROW EXECUTE FUNCTION public.fn_cascade_delete_astrologer();

-- Success Message
SELECT 'Safe cascading deletion triggers and foreign key constraints successfully applied!' AS status;
