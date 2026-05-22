-- CreateEnum
CREATE TYPE "LoyaltyTransactionType" AS ENUM ('EARNED', 'REDEEMED');

-- AlterTable
ALTER TABLE "PointsTransaction" ADD COLUMN     "type" "LoyaltyTransactionType" NOT NULL DEFAULT 'EARNED';
