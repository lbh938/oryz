import { createClient } from '@/lib/supabase/client';

/**
 * API Admin pour ORYZ Stream
 * Gestion du Hero et Analytics en temps réel
 */

export interface HeroConfig {
  id?: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  image_url: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ActiveVisitor {
  session_id: string;
  user_agent?: string;
  current_page: string;
  ip_address?: string;
  last_seen: string;
}

export interface PageView {
  page_url: string;
  page_title?: string;
  session_id?: string;
  user_agent?: string;
  referrer?: string;
  ip_address?: string;
}

export interface TopPage {
  page_url: string;
  page_title?: string;
  view_count: number;
  unique_visitors: number;
}

// =====================================================
// HERO MANAGEMENT
// =====================================================

/**
 * Récupérer tous les heroes actifs dans l'ordre
 */
export async function getActiveHeroes(): Promise<HeroConfig[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('hero_config')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching heroes:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupérer la configuration du hero actif (pour compatibilité)
 */
export async function getActiveHeroConfig(): Promise<HeroConfig | null> {
  const heroes = await getActiveHeroes();
  return heroes.length > 0 ? heroes[0] : null;
}

/**
 * Mettre à jour la configuration du hero
 */
export async function updateHeroConfig(
  config: Omit<HeroConfig, 'id' | 'is_active' | 'created_at' | 'updated_at'>,
  heroId?: string
): Promise<boolean> {
  const supabase = createClient();

  try {
    // Si un heroId est fourni, mettre à jour ce hero spécifique
    if (heroId) {
      const { error } = await supabase
        .from('hero_config')
        .update({
          title: config.title,
          subtitle: config.subtitle,
          cta_text: config.cta_text,
          cta_url: config.cta_url,
          image_url: config.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', heroId);

      if (error) {
        console.error('Error updating hero config:', error);
        return false;
      }
    } else {
      // Sinon, mettre à jour le premier hero actif (pour compatibilité)
      const { data: firstHero } = await supabase
        .from('hero_config')
        .select('id')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(1)
        .single();

      if (!firstHero) {
        console.error('No active hero found to update');
        return false;
      }

      const { error } = await supabase
        .from('hero_config')
        .update({
          title: config.title,
          subtitle: config.subtitle,
          cta_text: config.cta_text,
          cta_url: config.cta_url,
          image_url: config.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', firstHero.id);

      if (error) {
        console.error('Error updating hero config:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Exception updating hero config:', error);
    return false;
  }
}

// =====================================================
// ANALYTICS - VISITEURS ACTIFS
// =====================================================

/**
 * Enregistrer/Mettre à jour un visiteur actif
 */
export async function trackActiveVisitor(visitor: ActiveVisitor): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('active_visitors')
    .upsert({
      session_id: visitor.session_id,
      user_agent: visitor.user_agent,
      current_page: visitor.current_page,
      ip_address: visitor.ip_address,
      last_seen: new Date().toISOString()
    }, {
      onConflict: 'session_id'
    });

  if (error) {
    console.error('Error tracking visitor:', error);
    return false;
  }

  return true;
}

/**
 * Compter les visiteurs actifs
 */
export async function getActiveVisitorsCount(): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('count_active_visitors');

  if (error) {
    console.error('Error counting visitors:', error);
    return 0;
  }

  return data || 0;
}

/**
 * Récupérer la liste des visiteurs actifs
 */
export async function getActiveVisitors(): Promise<ActiveVisitor[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('active_visitors')
    .select('*')
    .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .order('last_seen', { ascending: false });

  if (error) {
    console.error('Error fetching visitors:', error);
    return [];
  }

  return data || [];
}

// =====================================================
// ANALYTICS - PAGE VIEWS
// =====================================================

/**
 * Enregistrer une vue de page
 */
export async function trackPageView(pageView: PageView): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('page_views')
    .insert({
      page_url: pageView.page_url,
      page_title: pageView.page_title,
      session_id: pageView.session_id,
      user_agent: pageView.user_agent,
      referrer: pageView.referrer,
      ip_address: pageView.ip_address,
      viewed_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error tracking page view:', error);
    return false;
  }

  return true;
}

/**
 * Récupérer les pages les plus vues (24h)
 */
export async function getTopPages24h(): Promise<TopPage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('top_pages_24h')
    .select('*');

  if (error) {
    console.error('Error fetching top pages 24h:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupérer les pages les plus vues (7 jours)
 */
export async function getTopPages7d(): Promise<TopPage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('top_pages_7d')
    .select('*');

  if (error) {
    console.error('Error fetching top pages 7d:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupérer les statistiques globales
 */
export async function getGlobalStats(): Promise<{
  totalViews24h: number;
  totalViews7d: number;
  uniqueVisitors24h: number;
  uniqueVisitors7d: number;
}> {
  const supabase = createClient();

  // Vues des dernières 24h
  const { count: views24h } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .gte('viewed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Vues des derniers 7 jours
  const { count: views7d } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .gte('viewed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  // Visiteurs uniques 24h
  const { data: unique24h } = await supabase
    .from('page_views')
    .select('session_id')
    .gte('viewed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Visiteurs uniques 7 jours
  const { data: unique7d } = await supabase
    .from('page_views')
    .select('session_id')
    .gte('viewed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const uniqueSet24h = new Set(unique24h?.map(v => v.session_id) || []);
  const uniqueSet7d = new Set(unique7d?.map(v => v.session_id) || []);

  return {
    totalViews24h: views24h || 0,
    totalViews7d: views7d || 0,
    uniqueVisitors24h: uniqueSet24h.size,
    uniqueVisitors7d: uniqueSet7d.size
  };
}

// =====================================================
// ADMIN AUTH
// =====================================================

/**
 * Vérifier si l'utilisateur est admin
 */
export async function isAdmin(email: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', email)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

