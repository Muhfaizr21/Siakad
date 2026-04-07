import re

with open('backend/database/migrations/01_ormawa_schema.sql', 'r') as f:
    sql = f.read()

# Make sure we don't repeat headers if run twice
if 'CREATE SCHEMA IF NOT EXISTS ormawa;' not in sql:
    header = """
CREATE SCHEMA IF NOT EXISTS ormawa;
SET search_path TO ormawa, public;
"""
    sql = header + sql

# Prefix explicit public creations for types
sql = re.sub(r'CREATE TYPE\s+(gender)\s+AS', r'CREATE TYPE public.\1 AS', sql)

# Prefix explicit public creations for tables
tables_to_public = ['roles', 'permissions', 'role_permissions', 'users', 'anggota']
for t in tables_to_public:
    # CREATE TABLE
    sql = re.sub(rf'CREATE TABLE\s+{t}\s*\(', f'CREATE TABLE public.{t} (', sql)
    # INDEXES
    sql = re.sub(rf'CREATE INDEX\s+(idx_{t}_\w+)\s+ON\s+{t}\(', rf'CREATE INDEX \1 ON public.{t}(', sql)
    # TRIGGERS (UPDATE ON)
    sql = re.sub(rf'ON\s+{t}\s+FOR', rf'ON public.{t} FOR', sql)

# For role_permissions there are inserts
sql = re.sub(rf'INSERT INTO\s+roles\s*\(', f'INSERT INTO public.roles (', sql)
sql = re.sub(rf'INSERT INTO\s+permissions\s*\(', f'INSERT INTO public.permissions (', sql)
sql = re.sub(rf'INSERT INTO\s+role_permissions\s*\(', f'INSERT INTO public.role_permissions (', sql)
sql = re.sub(rf'FROM\s+roles\s+', f'FROM public.roles ', sql)
sql = re.sub(rf'JOIN\s+permissions\s+p', f'JOIN public.permissions p', sql)

with open('backend/database/migrations/01_ormawa_schema.sql', 'w') as f:
    f.write(sql)

print("SQL transformed to use schemas!")
