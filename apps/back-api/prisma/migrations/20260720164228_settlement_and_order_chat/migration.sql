/*
  Warnings:

  - A unique constraint covering the columns `[businessGroupId]` on the table `PaymentTransaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[b2bOrderId]` on the table `PaymentTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'DISTRIBUTED', 'FAILED');

-- AlterEnum
ALTER TYPE "NegotiationType" ADD VALUE 'ORDER';

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'READY_FOR_SHIPMENT';

-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN     "b2bOrderId" TEXT,
ADD COLUMN     "businessGroupId" TEXT;

-- CreateTable
CREATE TABLE "PlatformSettlement" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "businessGroupId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "deliveryFee" DOUBLE PRECISION NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "distributedAt" TIMESTAMP(3),
    "distributedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSettlement_businessGroupId_key" ON "PlatformSettlement"("businessGroupId");

-- CreateIndex
CREATE INDEX "PlatformSettlement_businessId_idx" ON "PlatformSettlement"("businessId");

-- CreateIndex
CREATE INDEX "PlatformSettlement_orderId_idx" ON "PlatformSettlement"("orderId");

-- CreateIndex
CREATE INDEX "PlatformSettlement_status_idx" ON "PlatformSettlement"("status");

-- CreateIndex
CREATE INDEX "PlatformSettlement_createdAt_idx" ON "PlatformSettlement"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_businessGroupId_key" ON "PaymentTransaction"("businessGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_b2bOrderId_key" ON "PaymentTransaction"("b2bOrderId");

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_businessGroupId_fkey" FOREIGN KEY ("businessGroupId") REFERENCES "OrderBusinessGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_b2bOrderId_fkey" FOREIGN KEY ("b2bOrderId") REFERENCES "B2BOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformSettlement" ADD CONSTRAINT "PlatformSettlement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformSettlement" ADD CONSTRAINT "PlatformSettlement_businessGroupId_fkey" FOREIGN KEY ("businessGroupId") REFERENCES "OrderBusinessGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformSettlement" ADD CONSTRAINT "PlatformSettlement_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
