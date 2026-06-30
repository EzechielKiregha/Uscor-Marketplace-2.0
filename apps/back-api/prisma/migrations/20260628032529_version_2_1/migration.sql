-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('SYNCED', 'PENDING_SYNC', 'SYNCING', 'FAILED', 'CONFLICT');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "imei" TEXT,
ADD COLUMN     "serialNumber" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "warrantyMonths" INTEGER;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "deviceId" TEXT,
ADD COLUMN     "isOffline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "localId" TEXT,
ADD COLUMN     "localTimestamp" TIMESTAMP(3),
ADD COLUMN     "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "Sale_localId_idx" ON "Sale"("localId");
