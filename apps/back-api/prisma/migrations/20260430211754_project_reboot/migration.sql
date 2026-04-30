-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdjustmentType" ADD VALUE 'RESTOCK';
ALTER TYPE "AdjustmentType" ADD VALUE 'DAMAGE';
ALTER TYPE "AdjustmentType" ADD VALUE 'SHRINKAGE';
ALTER TYPE "AdjustmentType" ADD VALUE 'LOSS';
ALTER TYPE "AdjustmentType" ADD VALUE 'CORRECTION';
ALTER TYPE "AdjustmentType" ADD VALUE 'RETURN';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SaleStatus" ADD VALUE 'PENDING';
ALTER TYPE "SaleStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "SaleStatus" ADD VALUE 'CANCELLED';
