-- Add branding fields to SiteSettings
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "hospitalName" TEXT NOT NULL DEFAULT 'Gweru Specialist Children''s Hospital';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "tagline" TEXT NOT NULL DEFAULT 'Digital Record System';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "footerText" TEXT NOT NULL DEFAULT '© 2026 Gweru Specialist Children''s Hospital';

-- Add accent color for auto-theming from logo
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "accentColor" TEXT;
