-- AlterTable
ALTER TABLE "LoyaltyProgram" ADD COLUMN     "description" TEXT,
ADD COLUMN     "minimumPointsToRedeem" DOUBLE PRECISION DEFAULT 0;
