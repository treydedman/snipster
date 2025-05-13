import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hpnigpphcxzmxtfvrlyz.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbmlncHBoY3h6bXh0ZnZybHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NzM4MDMsImV4cCI6MjA2MTM0OTgwM30.KdLocdFukSFU_J6lurkjn-cb11eVe5H_RdFEvemOzt4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
