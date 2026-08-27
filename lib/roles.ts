import type { MemberRole } from './types';

export const ROLE_ACCESS: Record<MemberRole, string[]> = {
  // 'pending' is what every new sign-in gets: zero access until an owner
  // promotes them. Never add a section here.
  pending: [],
  owner: ['*'],
  admin: ['agenda','speakers','team','sponsors','highlights','stats','faqs','gallery','announcements','settings','checkin','activity'],
  program: ['agenda','speakers'],
  comms: ['announcements','gallery','faqs','team','highlights','stats'],
  partnerships: ['sponsors','speakers'],
  volunteer: ['checkin'],
};

export const ROLE_LABELS: Record<MemberRole, string> = {
  pending: 'Pending approval',
  owner: 'Owner',
  admin: 'Admin',
  program: 'Program Editor',
  comms: 'Comms Editor',
  partnerships: 'Partnerships',
  volunteer: 'Door Volunteer',
};

export const CAN_PUBLISH: MemberRole[] = ['owner', 'admin', 'program', 'comms'];

export function can(role: MemberRole, section: string): boolean {
  const allowed = ROLE_ACCESS[role] ?? [];
  return allowed[0] === '*' || allowed.includes(section);
}
