import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Create Supabase client with TypeScript support
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, metadata: any = {}) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getCurrentSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};

// Database helper functions
export const db = {
  // Helper function to handle database errors
  handleError: (error: any) => {
    console.error('Database error:', error);
    
    if (error.code === 'PGRST116') {
      throw new Error('No data found');
    }
    
    if (error.code === '23505') {
      throw new Error('Data already exists');
    }
    
    if (error.code === '23503') {
      throw new Error('Referenced data not found');
    }
    
    throw new Error(error.message || 'Database operation failed');
  },

  // Generic query helper
  query: async (table: string, options: any = {}) => {
    try {
      let query = supabase.from(table).select(options.select || '*');
      
      if (options.eq) {
        Object.entries(options.eq).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (options.order) {
        query = query.order(options.order.column, options.order.options || {});
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        db.handleError(error);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Generic insert helper
  insert: async (table: string, data: any) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        db.handleError(error);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Generic update helper
  update: async (table: string, id: string, data: any) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        db.handleError(error);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Generic delete helper
  delete: async (table: string, id: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        db.handleError(error);
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  },
};

// Real-time subscriptions helper
export const realtime = {
  subscribe: (channel: string, table: string, filter: string, callback: (payload: any) => void) => {
    return supabase
      .channel(channel)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter,
        },
        callback
      )
      .subscribe();
  },

  unsubscribe: (subscription: any) => {
    return supabase.removeChannel(subscription);
  },
};

// Storage helper (for future file uploads)
export const storage = {
  upload: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },

  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },
};

export default supabase;
