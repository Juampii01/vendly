-- Add 'gym' to the site_type check constraint
-- Drop existing constraint and recreate with gym included

ALTER TABLE public.store_config
  DROP CONSTRAINT IF EXISTS store_config_site_type_check;

ALTER TABLE public.store_config
  ADD CONSTRAINT store_config_site_type_check
  CHECK (site_type IN (
    'ecommerce',
    'landing',
    'portfolio',
    'restaurant',
    'services',
    'modo',
    'athletic',
    'dealership',
    'libreria',
    'vendly-marketing',
    'real-estate',
    'gym'
  ));
