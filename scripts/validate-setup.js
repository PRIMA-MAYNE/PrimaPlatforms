#!/usr/bin/env node

// API Key Validation and Real-time Setup Test for Catalyst Education
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🎓 Catalyst Education - System Validation\n');

// 1. Validate Environment Variables
console.log('1️⃣ Checking Environment Variables...');
if (!SUPABASE_URL) {
  console.error('❌ VITE_SUPABASE_URL is missing');
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);

// 2. Validate API Keys
console.log('\n2️⃣ Validating Supabase Connection...');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

try {
  // Test connection by getting session
  const { data: session, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('❌ Supabase connection failed:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Supabase connection successful');
  
  // 3. Test Database Access
  console.log('\n3️⃣ Testing Database Access...');
  
  const { data: tables, error: dbError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (dbError && dbError.code !== 'PGRST116') {
    console.error('❌ Database access failed:', dbError.message);
    console.log('   This usually means the schema hasn\'t been run yet.');
    console.log('   Please run the schema.sql file in your Supabase dashboard.');
  } else {
    console.log('✅ Database access working');
  }
  
  // 4. Test Real-time Capabilities
  console.log('\n4️⃣ Testing Real-time Capabilities...');
  
  const channel = supabase
    .channel('test-channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'profiles'
    }, (payload) => {
      console.log('📡 Real-time event received:', payload);
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time subscriptions working');
        
        // Clean up
        setTimeout(() => {
          supabase.removeChannel(channel);
          console.log('\n🎉 All systems operational!');
          console.log('\n📋 Next Steps:');
          console.log('   1. Deploy to Render using render.yaml');
          console.log('   2. Set environment variables in Render dashboard');
          console.log('   3. Test the live application');
          process.exit(0);
        }, 2000);
      } else if (status === 'CHANNEL_ERROR') {
        console.log('⚠️  Real-time subscriptions unavailable (still functional)');
        process.exit(0);
      }
    });
  
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
}
