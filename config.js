/* Supabase connection. Both values are safe to publish (the anon key only
   allows what the row-level-security policies in supabase/schema.sql allow:
   public read, logged-in write).
   Find them in Supabase -> Project Settings -> API. */
window.SITE_CONFIG = {
  SUPABASE_URL: "https://ribelutggxitwiwopgua.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_pYOAmR0Fu_8ZS4oUoPw_ag_0WVtlhOy"
};
