-- AlterTable
ALTER TABLE "AccountRecharge" ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Ad" ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "FreelanceOrder" ALTER COLUMN "totalAmount" SET DEFAULT 0,
ALTER COLUMN "escrowAmount" SET DEFAULT 0,
ALTER COLUMN "commissionPercent" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "FreelanceService" ALTER COLUMN "rate" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "LoyaltyProgram" ALTER COLUMN "pointsPerPurchase" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "PaymentTransaction" ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "PointsTransaction" ALTER COLUMN "points" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "PostOfSale" ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "PostTransaction" ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "ReOwnedProduct" ALTER COLUMN "oldPrice" SET DEFAULT 0,
ALTER COLUMN "newPrice" SET DEFAULT 0,
ALTER COLUMN "markupPercentage" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Sale" ALTER COLUMN "totalAmount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "SaleProduct" ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "TokenTransaction" ALTER COLUMN "amount" SET DEFAULT 0;
