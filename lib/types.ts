export type ContentStatus = 'draft' | 'published' | 'archived';
export type MemberRole =
  | 'pending' | 'owner' | 'admin' | 'program' | 'comms' | 'partnerships' | 'volunteer';
export type SessionKind = 'keynote' | 'talk' | 'workshop' | 'jam' | 'break' | 'networking' | 'admin';

export interface EventSettings {
  id: boolean;
  name: string;
  starts_at: string;
  ends_at: string;
  venue_name: string | null;
  venue_address: string | null;
  map_query: string | null;
  registration_url: string | null;
  registration_open: boolean;
  cost_label: string | null;
  capacity_note: string | null;
  hero_headline: string | null;
  hero_subline: string | null;
  registered_count: number;
}

export interface AgendaItem {
  id: string;
  starts_at: string;
  ends_at: string;
  title: string;
  attribution: string | null;
  description: string | null;
  kind: SessionKind;
  room: string | null;
  status: ContentStatus;
  sort_order: number;
}

export interface Speaker {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  topic: string | null;
  bio: string | null;
  headshot_path: string | null;
  linkedin_url: string | null;
  is_keynote: boolean;
  announce_at: string | null;
  status: ContentStatus;
  sort_order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role_label: string | null;
  title_label: string | null;
  bio: string | null;
  initials: string | null;
  headshot_path: string | null;
  linkedin_url: string | null;
  tier: 'lead' | 'member' | 'alumni';
  status: ContentStatus;
  sort_order: number;
}

export interface Sponsor {
  id: string; name: string; logo_path: string | null; website_url: string | null;
  blurb: string | null; tier: 'platinum' | 'gold' | 'silver' | 'community';
  status: ContentStatus; sort_order: number;
}

export interface Highlight {
  id: string; title: string; description: string | null;
  status: ContentStatus; sort_order: number;
}

export interface Stat {
  id: string; value: string; label: string;
  status: ContentStatus; sort_order: number;
}

export interface Faq {
  id: string; question: string; answer: string; category: string | null;
  status: ContentStatus; sort_order: number;
}

export interface GalleryItem {
  id: string; image_path: string; caption: string | null; event_label: string | null;
  alt_text: string | null; status: ContentStatus; sort_order: number;
}

export interface Announcement {
  id: string; body: string; level: 'info' | 'important' | 'urgent';
  link_url: string | null; starts_at: string | null; ends_at: string | null; active: boolean;
}

export interface Profile {
  id: string; display_name: string; email: string;
  role: MemberRole; avatar_path: string | null; active: boolean;
}

export interface Checkin {
  id: string; attendee_name: string; email: string | null; ticket_code: string | null;
  source: string; checked_in_at: string;
}

export interface AuditEntry {
  id: number; actor_id: string | null; table_name: string;
  record_id: string | null; action: string; created_at: string;
}
