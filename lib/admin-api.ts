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
  image_mobile_url?: string; // Image spécifique pour mobile
  image_desktop_url?: string; // Image spécifique pour desktop
  mobile_aspect_ratio?: number; // Ratio mobile pour le recadrage (défaut: 16/9 = 1.778)
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
 * Récupérer tous les heroes (actifs et inactifs) pour l'admin
 */
export async function getAllHeroes(): Promise<HeroConfig[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('hero_config')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all heroes:', error);
    return [];
  }

  return data || [];
}

/**
 * Créer un nouveau hero
 */
export async function createHero(
  config: Omit<HeroConfig, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createClient();

  try {
    // Obtenir le dernier ordre d'affichage
    const { data: lastHero } = await supabase
      .from('hero_config')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = lastHero ? (lastHero.display_order || 0) + 1 : 1;

    const { data, error } = await supabase
      .from('hero_config')
      .insert({
        title: config.title,
        subtitle: config.subtitle,
        cta_text: config.cta_text,
        cta_url: config.cta_url,
        image_url: config.image_url,
        image_mobile_url: config.image_mobile_url || null,
        image_desktop_url: config.image_desktop_url || null,
        mobile_aspect_ratio: config.mobile_aspect_ratio || 16 / 9,
        is_active: config.is_active !== undefined ? config.is_active : true,
        display_order: config.display_order || nextOrder
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating hero:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Exception creating hero:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
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
          image_mobile_url: config.image_mobile_url || null,
          image_desktop_url: config.image_desktop_url || null,
          mobile_aspect_ratio: config.mobile_aspect_ratio || 16 / 9,
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
          image_mobile_url: config.image_mobile_url || null,
          image_desktop_url: config.image_desktop_url || null,
          mobile_aspect_ratio: config.mobile_aspect_ratio || 16 / 9,
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

/**
 * Supprimer un hero et son image du storage
 */
export async function deleteHero(heroId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    // 1. Récupérer toutes les images du hero avant suppression
    const { data: hero } = await supabase
      .from('hero_config')
      .select('image_url, image_mobile_url, image_desktop_url')
      .eq('id', heroId)
      .single();

    // Fonction helper pour supprimer une image du storage
    const deleteImageFromStorage = async (imageUrl: string | null | undefined) => {
      if (!imageUrl) return;
      
      try {
        const urlWithoutParams = imageUrl.split('?')[0];
        const storageMatch = urlWithoutParams.match(/\/hero-images\/(.+)$/);
        
        if (storageMatch && storageMatch[1]) {
          const filePath = storageMatch[1];
          const { error: storageError } = await supabase.storage
            .from('hero-images')
            .remove([filePath]);
          
          if (storageError) {
            console.warn('Error deleting hero image from storage:', storageError);
          }
        }
      } catch (storageErr) {
        console.warn('Exception deleting hero image from storage:', storageErr);
      }
    };

    // 2. Supprimer toutes les images du storage
    await Promise.all([
      deleteImageFromStorage(hero?.image_url),
      deleteImageFromStorage(hero?.image_mobile_url),
      deleteImageFromStorage(hero?.image_desktop_url)
    ]);

    // 3. Supprimer le hero de la base de données
    const { error } = await supabase
      .from('hero_config')
      .delete()
      .eq('id', heroId);

    if (error) {
      console.error('Error deleting hero:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting hero:', error);
    return false;
  }
}

/**
 * Mettre à jour l'ordre d'affichage d'un hero
 */
export async function updateHeroOrder(heroId: string, displayOrder: number): Promise<boolean> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('hero_config')
      .update({ display_order: displayOrder, updated_at: new Date().toISOString() })
      .eq('id', heroId);

    if (error) {
      console.error('Error updating hero order:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating hero order:', error);
    return false;
  }
}

/**
 * Activer/désactiver un hero
 */
export async function toggleHeroActive(heroId: string, isActive: boolean): Promise<boolean> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('hero_config')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', heroId);

    if (error) {
      console.error('Error toggling hero active:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception toggling hero active:', error);
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
// APP SETTINGS
// =====================================================

/**
 * Récupérer un paramètre de l'application
 */
export async function getAppSetting(key: string): Promise<string | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching app setting '${key}':`, error);
    return null;
  }

  if (!data) {
    console.log(`App setting '${key}' not found, returning null`);
    return null;
  }

  return data.value;
}

/**
 * Mettre à jour un paramètre de l'application
 */
export async function updateAppSetting(key: string, value: string, description?: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('User not authenticated for updateAppSetting:', authError);
    return false;
  }

  console.log(`Updating app setting '${key}' to '${value}'`);

  // Vérifier si le paramètre existe
  const { data: existing, error: fetchError } = await supabase
    .from('app_settings')
    .select('id')
    .eq('key', key)
    .maybeSingle();

  if (fetchError) {
    console.error(`Error checking existing setting '${key}':`, fetchError);
    return false;
  }

  if (existing) {
    // Mettre à jour
    console.log(`Updating existing setting '${key}' (id: ${existing.id})`);
    const { error } = await supabase
      .from('app_settings')
      .update({
        value,
        description: description || undefined,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('key', key);

    if (error) {
      console.error(`Error updating setting '${key}':`, error);
      return false;
    }
    console.log(`Successfully updated setting '${key}'`);
    return true;
  } else {
    // Créer
    console.log(`Creating new setting '${key}'`);
    const { error } = await supabase
      .from('app_settings')
      .insert({
        key,
        value,
        description: description || undefined,
        updated_by: user.id
      });

    if (error) {
      console.error(`Error creating setting '${key}':`, error);
      return false;
    }
    console.log(`Successfully created setting '${key}'`);
    return true;
  }
}

/**
 * Récupérer tous les paramètres de l'application
 */
export async function getAllAppSettings(): Promise<Record<string, string>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value');

  if (error || !data) {
    return {};
  }

  return data.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<string, string>);
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

/**
 * Vérifier les doublons de heroes (même titre et même URL CTA)
 */
export async function checkDuplicateHeroes(): Promise<{
  duplicates: Array<{
    title: string;
    cta_url: string;
    count: number;
    hero_ids: string[];
  }>;
}> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('hero_config')
    .select('id, title, cta_url, created_at');
  
  if (error) {
    console.error('Error checking duplicates:', error);
    return { duplicates: [] };
  }
  
  // Grouper par titre et cta_url pour trouver les doublons
  const grouped = new Map<string, Array<{ id: string; title: string; cta_url: string; created_at: string }>>();
  
  data?.forEach(hero => {
    const key = `${hero.title}|${hero.cta_url}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push({
      id: hero.id,
      title: hero.title,
      cta_url: hero.cta_url,
      created_at: hero.created_at || ''
    });
  });
  
  // Trouver les doublons
  const duplicates = Array.from(grouped.entries())
    .filter(([_, heroes]) => heroes.length > 1)
    .map(([_, heroes]) => ({
      title: heroes[0].title,
      cta_url: heroes[0].cta_url,
      count: heroes.length,
      hero_ids: heroes
        .sort((a, b) => {
          // Trier par date de création (plus récent en premier)
          const dateA = new Date(a.created_at || '');
          const dateB = new Date(b.created_at || '');
          return dateB.getTime() - dateA.getTime();
        })
        .map(h => h.id)
    }));
  
  return { duplicates };
}

