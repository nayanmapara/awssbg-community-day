import type { MemberRole } from './types';

export type FieldType = 'text' | 'area' | 'select' | 'upload' | 'datetime';

export interface FieldSpec {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  placeholder?: string;
  hint?: string;
  required?: boolean;
  bucket?: string;
}

export interface CollectionSpec {
  key: string;
  table: string;
  title: string;
  desc: string;
  newLabel: string;
  section: string;          // shown in the publish diff
  revalidate: string[];     // paths to revalidate on publish
  labelField: string;
  roles: MemberRole[];
  readOnly?: boolean;
  reorderable?: boolean;   // false for tables without sort_order
  columns: { label: string; key: string; width: string }[];
  fields: FieldSpec[];
}

export const COLLECTIONS: Record<string, CollectionSpec> = {
  agenda: {
    key: 'agenda', table: 'agenda_items', title: 'Agenda',
    desc: 'Reorder sessions and the rocket flight path on the site follows automatically. Times drive live mode on event day.',
    newLabel: '+ NEW SESSION', section: 'Home / Agenda', revalidate: ['/'],
    labelField: 'title', roles: ['owner', 'admin', 'program'],
    columns: [
      { label: 'TIME', key: 'starts_at', width: '190px' },
      { label: 'SESSION', key: 'title', width: '1fr' },
      { label: 'ROOM', key: 'room', width: '120px' },
    ],
    fields: [
      { key: 'starts_at', label: 'STARTS', type: 'datetime', required: true, hint: 'Real timestamp — this is what live mode reads on the day.' },
      { key: 'ends_at', label: 'ENDS', type: 'datetime', required: true },
      { key: 'title', label: 'SESSION TITLE', placeholder: 'AWS Jam', required: true },
      { key: 'attribution', label: 'ATTRIBUTION', placeholder: 'SPEAKER TBA', hint: 'Small line under the title. Leave blank for breaks.' },
      { key: 'kind', label: 'SESSION TYPE', type: 'select', options: ['keynote','talk','workshop','jam','break','networking','admin'] },
      { key: 'room', label: 'ROOM', placeholder: 'B240' },
      { key: 'description', label: 'DESCRIPTION', type: 'area' },
    ],
  },
  speakers: {
    key: 'speakers', table: 'speakers', title: 'Speakers',
    desc: 'Drafts stay behind the radar placeholder on the site. Publish to reveal, or set a reveal time for a staged announcement.',
    newLabel: '+ NEW SPEAKER', section: 'Speakers page', revalidate: ['/', '/speakers'],
    labelField: 'name', roles: ['owner', 'admin', 'program', 'partnerships'],
    columns: [
      { label: 'NAME', key: 'name', width: '1fr' },
      { label: 'ROLE', key: 'title', width: '1fr' },
      { label: 'TOPIC', key: 'topic', width: '1fr' },
    ],
    fields: [
      { key: 'headshot_path', label: 'HEADSHOT', type: 'upload', bucket: 'headshots', hint: 'Square crop, max 2MB. Required before publishing.' },
      { key: 'name', label: 'FULL NAME', placeholder: 'Jane Doe', required: true },
      { key: 'title', label: 'JOB TITLE', placeholder: 'Solutions Architect' },
      { key: 'company', label: 'COMPANY', placeholder: 'Amazon Web Services' },
      { key: 'topic', label: 'TALK TITLE', placeholder: 'Scaling on AWS' },
      { key: 'bio', label: 'BIO', type: 'area', hint: 'Required before publishing. Two or three sentences.' },
      { key: 'linkedin_url', label: 'LINKEDIN URL', placeholder: 'https://linkedin.com/in/…' },
      { key: 'announce_at', label: 'SCHEDULED REVEAL', type: 'datetime', hint: 'Optional. Stays hidden from the public until this moment.' },
    ],
  },
  team: {
    key: 'team', table: 'team_members', title: 'Team & Members',
    desc: 'Leads show on the Team page; members go to the Members page. Initials generate from the name automatically.',
    newLabel: '+ NEW MEMBER', section: 'Team page', revalidate: ['/team', '/members'],
    labelField: 'name', roles: ['owner', 'admin', 'comms'],
    columns: [
      { label: 'NAME', key: 'name', width: '1fr' },
      { label: 'ROLE', key: 'role_label', width: '1fr' },
      { label: 'TIER', key: 'tier', width: '110px' },
    ],
    fields: [
      { key: 'headshot_path', label: 'PHOTO (OPTIONAL)', type: 'upload', bucket: 'headshots', hint: 'Leave empty to use the initials avatar.' },
      { key: 'name', label: 'FULL NAME', placeholder: 'Neel Patel', required: true },
      { key: 'role_label', label: 'ROLE LABEL', placeholder: 'SBG LEAD' },
      { key: 'title_label', label: 'TITLE LABEL', placeholder: 'PRESIDENT' },
      { key: 'tier', label: 'TIER', type: 'select', options: ['lead', 'member', 'alumni'] },
      { key: 'bio', label: 'BIO', type: 'area' },
      { key: 'linkedin_url', label: 'LINKEDIN URL' },
    ],
  },
  sponsors: {
    key: 'sponsors', table: 'sponsors', title: 'Sponsors',
    desc: 'Empty tiers fall back to the dashed "your logo here" tiles on the site, so the section never looks broken.',
    newLabel: '+ NEW SPONSOR', section: 'Home / Sponsors', revalidate: ['/'],
    labelField: 'name', roles: ['owner', 'admin', 'partnerships'],
    columns: [
      { label: 'SPONSOR', key: 'name', width: '1fr' },
      { label: 'TIER', key: 'tier', width: '130px' },
      { label: 'WEBSITE', key: 'website_url', width: '1fr' },
    ],
    fields: [
      { key: 'logo_path', label: 'LOGO', type: 'upload', bucket: 'logos', hint: 'SVG or transparent PNG reads best on the dark background.' },
      { key: 'name', label: 'SPONSOR NAME', required: true },
      { key: 'tier', label: 'TIER', type: 'select', options: ['platinum', 'gold', 'silver', 'community'] },
      { key: 'website_url', label: 'WEBSITE', placeholder: 'https://…' },
      { key: 'blurb', label: 'SHORT BLURB', type: 'area' },
    ],
  },
  highlights: {
    key: 'highlights', table: 'highlights', title: 'Highlights',
    desc: 'The "What to expect" cards. Numbering is automatic and the grid recentres itself, so any count lays out cleanly.',
    newLabel: '+ NEW HIGHLIGHT', section: 'Home / What to expect', revalidate: ['/'],
    labelField: 'title', roles: ['owner', 'admin', 'comms'],
    columns: [
      { label: 'TITLE', key: 'title', width: '1fr' },
      { label: 'DESCRIPTION', key: 'description', width: '2fr' },
    ],
    fields: [
      { key: 'title', label: 'CARD TITLE', placeholder: 'Hands-on Labs', required: true },
      { key: 'description', label: 'DESCRIPTION', type: 'area', hint: 'One or two lines reads best in the card.' },
    ],
  },
  stats: {
    key: 'stats', table: 'stats', title: 'Stats',
    desc: 'The four numbers under "Built by students, for students". Free text on purpose so you can write "700+" rather than an exact figure.',
    newLabel: '+ NEW STAT', section: 'Home / About', revalidate: ['/', '/team', '/members'],
    labelField: 'label', roles: ['owner', 'admin', 'comms'],
    columns: [
      { label: 'VALUE', key: 'value', width: '120px' },
      { label: 'LABEL', key: 'label', width: '1fr' },
    ],
    fields: [
      { key: 'value', label: 'VALUE', placeholder: '700+', required: true, hint: 'Displayed large in accent blue.' },
      { key: 'label', label: 'LABEL', placeholder: 'MEMBERS', required: true, hint: 'Uppercase caption underneath.' },
    ],
  },
  faqs: {
    key: 'faqs', table: 'faqs', title: 'FAQ',
    desc: 'Answers feed the terminal-typing effect on the site. Keep them short — long answers take a while to type out.',
    newLabel: '+ NEW QUESTION', section: 'Home / FAQ', revalidate: ['/'],
    labelField: 'question', roles: ['owner', 'admin', 'comms'],
    columns: [
      { label: 'QUESTION', key: 'question', width: '1fr' },
      { label: 'ANSWER', key: 'answer', width: '2fr' },
    ],
    fields: [
      { key: 'question', label: 'QUESTION', placeholder: 'Is it free?', required: true },
      { key: 'answer', label: 'ANSWER', type: 'area', required: true, hint: 'Under about 180 characters types out nicely.' },
    ],
  },
  gallery: {
    key: 'gallery', table: 'gallery_items', title: 'Gallery',
    desc: 'Photos from past events. Until you upload some, the site shows placeholder slots.',
    newLabel: '+ UPLOAD PHOTO', section: 'Home / Gallery', revalidate: ['/'],
    labelField: 'caption', roles: ['owner', 'admin', 'comms'],
    columns: [
      { label: 'CAPTION', key: 'caption', width: '1fr' },
      { label: 'EVENT', key: 'event_label', width: '1fr' },
    ],
    fields: [
      { key: 'image_path', label: 'IMAGE', type: 'upload', bucket: 'gallery', required: true },
      { key: 'caption', label: 'CAPTION', placeholder: 'AWS Jam, Winter 2025' },
      { key: 'event_label', label: 'EVENT LABEL', placeholder: 'Workshop 04' },
      { key: 'alt_text', label: 'ALT TEXT', hint: 'Describe the photo for screen readers.' },
    ],
  },
  announcements: {
    key: 'announcements', table: 'announcements', title: 'Announcements',
    desc: 'The one thing that skips publishing — the banner reads live. Built for day-of room changes and delays.',
    newLabel: '+ NEW ANNOUNCEMENT', section: 'Site banner (live)', revalidate: [],
    labelField: 'body', roles: ['owner', 'admin', 'comms'],
    columns: [
      { label: 'MESSAGE', key: 'body', width: '2fr' },
      { label: 'LEVEL', key: 'level', width: '120px' },
    ],
    fields: [
      { key: 'body', label: 'MESSAGE', type: 'area', placeholder: 'Keynote moved to B240.', required: true },
      { key: 'level', label: 'URGENCY', type: 'select', options: ['info', 'important', 'urgent'] },
      { key: 'starts_at', label: 'SHOW FROM', type: 'datetime', hint: 'Optional. Blank = immediately.' },
      { key: 'ends_at', label: 'HIDE AFTER', type: 'datetime', hint: 'Optional. Blank = until you deactivate it.' },
    ],
  },
  users: {
    key: 'users', table: 'profiles', title: 'Users & Roles',
    desc: 'Google login restricted to club emails. Deactivating is one toggle — built for annual exec turnover.',
    newLabel: '', section: 'Access control', revalidate: [],
    labelField: 'display_name', roles: ['owner'], reorderable: false,
    columns: [
      { label: 'NAME', key: 'display_name', width: '1fr' },
      { label: 'EMAIL', key: 'email', width: '1fr' },
      { label: 'ROLE', key: 'role', width: '150px' },
    ],
    fields: [
      { key: 'display_name', label: 'NAME' },
      { key: 'role', label: 'ROLE', type: 'select', options: ['pending','owner','admin','program','comms','partnerships','volunteer'] },
    ],
  },
};

export const COLLECTION_KEYS = Object.keys(COLLECTIONS);

/** Sections whose drafts count toward the "unpublished changes" badge. */
export const PUBLISHABLE = ['agenda','speakers','team','sponsors','highlights','stats','faqs','gallery'];
