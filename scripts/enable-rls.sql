-- Turn on Row Level Security for every table in the public schema.
--
-- Why: the Supabase anon key ships in every visitor's browser by design. With
-- RLS off, anyone holding it can read and write these tables directly through
-- Supabase's REST API, bypassing the app entirely.
--
-- Why this is safe for Prodsnap: the app never reads tables through the
-- Supabase client. All data access goes through Prisma, which connects as the
-- table owner, and table owners bypass RLS. Login uses the auth schema, which
-- this does not touch. No policies are added, so the anon and authenticated
-- roles lose all direct table access, which is the intent.
--
-- Run it in the Supabase dashboard: SQL Editor, paste, Run.
-- Undo for one table:  ALTER TABLE public."TableName" DISABLE ROW LEVEL SECURITY;

-- 1. See the current state first.
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY 1;

-- 2. Enable RLS on every public table that does not have it yet.
DO $$
DECLARE t record;
BEGIN
    FOR t IN
        SELECT c.relname
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.relname);
        RAISE NOTICE 'RLS enabled on %', t.relname;
    END LOOP;
END $$;

-- 3. Confirm: every row should now say true.
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY 1;
