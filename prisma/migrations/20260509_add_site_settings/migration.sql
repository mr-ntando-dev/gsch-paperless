-- CreateTable: site_settings (singleton row for branding)
CREATE TABLE IF NOT EXISTS "site_settings" (
    "id"        TEXT         NOT NULL DEFAULT 'singleton',
    "siteName"  TEXT         NOT NULL DEFAULT 'MediFile',
    "logoUrl"   TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- Insert default row if it doesn't exist yet
INSERT INTO "site_settings" ("id", "siteName", "logoUrl", "updatedAt")
VALUES ('singleton', 'MediFile', NULL, now())
ON CONFLICT ("id") DO NOTHING;
