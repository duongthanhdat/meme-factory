-- Add slug column to projects table
ALTER TABLE projects ADD COLUMN slug TEXT;

-- Generate slugs for existing projects from name
-- Converts to lowercase, replaces spaces/special chars with hyphens, removes duplicates
UPDATE projects SET slug = 
  LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  ) || '-' || LEFT(id::text, 8);

-- Make slug NOT NULL and UNIQUE after populating
ALTER TABLE projects ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX idx_projects_slug ON projects(slug);

-- Add trigger to auto-generate slug on insert if not provided
CREATE OR REPLACE FUNCTION generate_project_slug()
RETURNS TRIGGER AS $func$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'),
          '\s+', '-', 'g'
        ),
        '-+', '-', 'g'
      )
    ) || '-' || LEFT(NEW.id::text, 8);
  END IF;
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

CREATE TRIGGER trg_project_slug
BEFORE INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION generate_project_slug();
