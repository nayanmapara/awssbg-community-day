import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

/** Session-aware client for Server Components, Server Actions and Route Handlers. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component render — middleware refreshes instead.
          }
        },
      },
    }
  );
}

/** Anonymous client for public, cacheable reads (no cookies -> stays static). */
export function createPublicClient() {
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}
