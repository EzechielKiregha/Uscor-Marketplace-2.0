-- AlterTable
ALTER TABLE "ClientPaymentMethod" ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "cardToken" TEXT,
ADD COLUMN     "expiryMonth" INTEGER,
ADD COLUMN     "expiryYear" INTEGER,
ADD COLUMN     "provider" "RechargeMethod";
