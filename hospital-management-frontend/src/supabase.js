import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use a mock client when credentials are placeholder/missing
const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder');

// A no-op mock so the app doesn't crash without real Supabase credentials
const mockClient = {
  from: () => ({
    select: () => Promise.resolve({ data: [], count: 0, error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
    order: function() { return this; },
    limit: function() { return this; },
    eq: function() { return this; },
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
  }),
  channel: () => ({
    on: function() { return this; },
    subscribe: () => ({}),
  }),
  removeChannel: () => {},
  storage: { from: () => ({ upload: () => Promise.resolve({ data: null, error: null }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({}),
  },
};

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockClient;

export const isSupabaseConfigured = isConfigured;
