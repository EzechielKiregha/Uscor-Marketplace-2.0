-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WorkerRole" ADD VALUE 'SUPERVISOR';
ALTER TYPE "WorkerRole" ADD VALUE 'PRIMARY';
ALTER TYPE "WorkerRole" ADD VALUE 'ASSISTANT';

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "businessType" TEXT DEFAULT 'NA',
ADD COLUMN     "notes" TEXT DEFAULT 'NA',
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "registrationNumber" TEXT DEFAULT 'NA',
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "taxId" TEXT DEFAULT 'NA',
ADD COLUMN     "totalClients" INTEGER DEFAULT 0,
ADD COLUMN     "totalRevenueGenerated" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "totalSales" INTEGER DEFAULT 0,
ADD COLUMN     "totalWorkers" INTEGER DEFAULT 0,
ADD COLUMN     "website" TEXT DEFAULT 'NA';
