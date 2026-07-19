import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://zfsmdmftxdsgejrbbagh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpmc21kbWZ0eGRzZ2VqcmJiYWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NDM0MzUsImV4cCI6MjEwMDAxOTQzNX0.TQMzDFwmFRlJmLD4sg7vr2d7_C0948M8zg_NVanSs74"
);