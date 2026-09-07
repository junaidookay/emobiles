-- Add foreign key from reviews.user_id to profiles.id
-- so PostgREST can embed profiles(full_name, avatar_url) on reviews queries.
-- Both reference auth.users(id), so the FK is safe.
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;
