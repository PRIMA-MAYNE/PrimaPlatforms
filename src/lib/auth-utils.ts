import { supabase } from './supabase';

// Utility to clear all auth-related data
export const clearAuthData = () => {
  try {
    // Clear Supabase auth storage
    const authKey = `sb-${supabase.supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
    localStorage.removeItem(authKey);
    
    // Clear application data
    const keysToRemove = [
      'catalyst-classes',
      'catalyst-grades', 
      'catalyst-attendance',
      'catalyst-lesson-plans',
      'catalyst-assessments',
      'catalyst-notifications'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Auth data cleared successfully');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Utility to handle auth errors
export const handleAuthError = (error: any) => {
  if (error.message.includes('Invalid Refresh Token') || 
      error.message.includes('Refresh Token Not Found')) {
    console.log('Refresh token invalid, clearing session...');
    clearAuthData();
    return true; // Indicates this was a refresh token error
  }
  return false;
};

// Utility to check if session is valid
export const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      if (handleAuthError(error)) {
        // Was a refresh token error, session cleared
        return null;
      }
      throw error;
    }
    
    return session;
  } catch (error) {
    console.error('Session validation error:', error);
    clearAuthData();
    return null;
  }
};

// Utility for safe sign out
export const safeSignOut = async () => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.log('Sign out error (non-critical):', error);
  } finally {
    // Always clear data regardless of sign out success
    clearAuthData();
  }
};
