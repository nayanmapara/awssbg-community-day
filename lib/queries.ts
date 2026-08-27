import { createPublicClient } from './supabase/server';
import { SUPABASE_URL } from './supabase/config';
import type {
  AgendaItem, EventSettings, Faq, GalleryItem, Highlight, Speaker, Sponsor, Stat, TeamMember,
} from './types';

/**
 * Public reads. RLS restricts these to status = 'published', so an anon key is
 * safe here. Pages that call these are statically rendered and refreshed by
 * revalidatePath() when an editor hits Publish.
 */

export async function getSettings(): Promise<EventSettings | null> {
  const sb = createPublicClient();
  const { data } = await sb.from('event_settings').select('*').eq('id', true).single();
  return data as EventSettings | null;
}

export async function getAgenda(): Promise<AgendaItem[]> {
  const sb = createPublicClient();
  const { data } = await sb.from('agenda_items').select('*')
    .eq('status', 'published').order('sort_order').order('starts_at');
  return (data ?? []) as AgendaItem[];
}

export async function getSpeakers(): Promise<Speaker[]> {
  const sb = createPublicClient();
  const { data } = await sb.from('speakers').select('*')
    .eq('status', 'published').order('sort_order');
  return (data ?? []) as Speaker[];
}

export async function getTeam(tier?: 'lead' | 'member'): Promise<TeamMember[]> {
  const sb = createPublicClient();
  let q = sb.from('team_members').select('*').eq('status', 'published');
  if (tier) q = q.eq('tier', tier);
  const { data } = await q.order('sort_order');
  return (data ?? []) as TeamMember[];
}

export async function getSponsors(): Promise<Sponsor[]> {
  const sb = createPublicClient();
  const { data } = await sb.from('sponsors').select('*')
    .eq('status', 'published').order('sort_order');
  return (data ?? []) as Sponsor[];
}

export async function getHighlights(): Promise<Highlight[]> {
  const sb = createPublicClient();
  const { data } = await sb.from('highlights').select('*')
    .eq('status', 'published').order('sort_order');
  return (data ?? []) as Highlight[];
}

export async function getStats(): Promise<Stat[]> {
  const sb = createPublicClient();
  const { data } = await sb.from('stats').select('*')
    .eq('status', 'published').order('sort_order');
  return (data ?? []) as Stat[];
}

/** Real member headcount from the database, for the Team and Members pages. */
export async function getMemberCount(): Promise<number> {
  const sb = createPublicClient();
  const { count } = await sb.from('team_members')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published').eq('tier', 'member');
  return count ?? 0;
}

export async function getFaqs(): Promise<Faq[]> {
  const sb = createPublicClient();
  const { data } = await sb.from('faqs').select('*')
    .eq('status', 'published').order('sort_order');
  return (data ?? []) as Faq[];
}

export async function getGallery(): Promise<GalleryItem[]> {
  const sb = createPublicClient();
  const { data } = await sb.from('gallery_items').select('*')
    .eq('status', 'published').order('sort_order');
  return (data ?? []) as GalleryItem[];
}

/** Public URL for a Storage object. */
export function mediaUrl(bucket: string, path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
