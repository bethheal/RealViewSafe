-- Add listedByAdmin flag for admin-created listings
ALTER TABLE "Property"
ADD COLUMN "listedByAdmin" BOOLEAN NOT NULL DEFAULT false;
