-- Create table to track in-app subscriptions (RevenueCat-backed)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entitlement_id TEXT NOT NULL DEFAULT 'premium',
  product_id TEXT NOT NULL,
  purchase_platform TEXT NOT NULL DEFAULT 'unknown', -- ios|android|web
  original_purchase_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiration_at TIMESTAMPTZ,
  latest_event JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, entitlement_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS user_subscriptions_user_idx ON public.user_subscriptions(user_id);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies: a user can read their own subscription status
DROP POLICY IF EXISTS "Read own subscription" ON public.user_subscriptions;
CREATE POLICY "Read own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Helper view for quick entitlement checks in UI
CREATE OR REPLACE VIEW public.v_user_entitlements AS
SELECT
  user_id,
  BOOL_OR(entitlement_id = 'premium') FILTER (WHERE expiration_at IS NULL OR expiration_at > now()) AS premium_active
FROM public.user_subscriptions
GROUP BY user_id;


