import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vfxhkpggcqpnqykvbuxd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeGhrcGdnY3FwbnF5a3ZidXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTQ0NzUsImV4cCI6MjA5ODA3MDQ3NX0.CmyO46VFqWb4S96Kyv5tRkpUjusYnvwbQoqRwRBr7nw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
