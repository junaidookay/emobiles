import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeroSettings {
  image_url: string;
  headline: string;
  morph_words: string[];
  subheadline: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
}

export const defaultHero: HeroSettings = {
  image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&h=600&fit=crop',
  headline: 'Experience',
  morph_words: ['Innovation', 'Technology', 'Excellence', 'The Future'],
  subheadline: "Discover premium electronics that redefine your everyday. Curated devices from the world's most innovative brands.",
  primary_cta_label: 'Explore Products',
  primary_cta_href: '/shop',
  secondary_cta_label: 'Browse Categories',
  secondary_cta_href: '/categories',
};

export const useSiteSetting = <T = any>(key: string, fallback: T) => {
  return useQuery({
    queryKey: ['site-setting', key],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('site_settings').select('value').eq('key', key).maybeSingle();
      if (error) throw error;
      return { ...(fallback as any), ...(data?.value || {}) } as T;
    },
  });
};

export const useHeroSettings = () => useSiteSetting<HeroSettings>('hero', defaultHero);

export interface FaviconSettings {
  url: string;
}

export const defaultFavicon: FaviconSettings = { url: '' };

export const useFaviconSettings = () => useSiteSetting<FaviconSettings>('favicon', defaultFavicon);

export interface BankTransferSettings {
  bank_name: string;
  account_title: string;
  account_number: string;
  iban: string;
  branch_code: string;
  instructions: string;
}

export const defaultBankTransfer: BankTransferSettings = {
  bank_name: 'Habib Bank Limited (HBL)',
  account_title: 'eMobiles (Pvt) Ltd',
  account_number: '1234-5678-9012-3',
  iban: 'PK36SCBL0000001234567890',
  branch_code: '0123',
  instructions: 'Please transfer the exact order amount and send screenshot of receipt to our WhatsApp or email for order confirmation.',
};

export const useBankTransferSettings = () => useSiteSetting<BankTransferSettings>('bank_transfer', defaultBankTransfer);

export interface FreeShippingSettings {
  enabled: boolean;
  threshold: number;
}

export const defaultFreeShipping: FreeShippingSettings = { enabled: true, threshold: 14000 };

export const useFreeShippingSettings = () => useSiteSetting<FreeShippingSettings>('free_shipping', defaultFreeShipping);

export const useUpdateSiteSetting = (key: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (value: any) => {
      const { error } = await (supabase as any)
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site-setting', key] }),
  });
};
