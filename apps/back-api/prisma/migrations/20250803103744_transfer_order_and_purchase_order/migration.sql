/*
  Warnings:

  - Made the column `role` on table `Worker` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "WorkerRole" ADD VALUE 'FREELANCER';

-- AlterTable
ALTER TABLE "Worker" ALTER COLUMN "role" SET NOT NULL;

-- CreateTable
CREATE TABLE "PurchaseOrderProduct" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseOrderProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferOrderProduct" (
    "id" TEXT NOT NULL,
    "transferOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferOrderProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PurchaseOrderProduct" ADD CONSTRAINT "PurchaseOrderProduct_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderProduct" ADD CONSTRAINT "PurchaseOrderProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferOrderProduct" ADD CONSTRAINT "TransferOrderProduct_transferOrderId_fkey" FOREIGN KEY ("transferOrderId") REFERENCES "TransferOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferOrderProduct" ADD CONSTRAINT "TransferOrderProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
