/*
  Warnings:

  - The `status` column on the `Chat` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `businessId` on the `ReOwnedProduct` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `ReOwnedProduct` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `ReOwnedProduct` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shippingId]` on the table `ReOwnedProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('PENDING', 'ACTIVE', 'CLOSED');

-- DropForeignKey
ALTER TABLE "ReOwnedProduct" DROP CONSTRAINT "ReOwnedProduct_businessId_fkey";

-- DropForeignKey
ALTER TABLE "ReOwnedProduct" DROP CONSTRAINT "ReOwnedProduct_productId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "status",
ADD COLUMN     "status" "ChatStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isPhysical" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ReOwnedProduct" DROP COLUMN "businessId",
DROP COLUMN "isApproved",
DROP COLUMN "productId",
ADD COLUMN     "isNewOwnerApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOriginalApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "newOwnerId" TEXT NOT NULL DEFAULT 'N/A',
ADD COLUMN     "newProductId" TEXT NOT NULL DEFAULT 'N/A',
ADD COLUMN     "originalProductId" TEXT NOT NULL DEFAULT 'N/A',
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shippingId" TEXT,
ALTER COLUMN "oldOwnerId" SET DEFAULT 'N/A';

-- CreateTable
CREATE TABLE "Shipping" (
    "id" TEXT NOT NULL,
    "reOwnedProductId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shipping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenTransaction" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "reOwnedProductId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BusinessToReOwnedProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BusinessToReOwnedProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BusinessToReOwnedProduct_B_index" ON "_BusinessToReOwnedProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ReOwnedProduct_shippingId_key" ON "ReOwnedProduct"("shippingId");

-- AddForeignKey
ALTER TABLE "ReOwnedProduct" ADD CONSTRAINT "ReOwnedProduct_newProductId_fkey" FOREIGN KEY ("newProductId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReOwnedProduct" ADD CONSTRAINT "ReOwnedProduct_originalProductId_fkey" FOREIGN KEY ("originalProductId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReOwnedProduct" ADD CONSTRAINT "ReOwnedProduct_shippingId_fkey" FOREIGN KEY ("shippingId") REFERENCES "Shipping"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenTransaction" ADD CONSTRAINT "TokenTransaction_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenTransaction" ADD CONSTRAINT "TokenTransaction_reOwnedProductId_fkey" FOREIGN KEY ("reOwnedProductId") REFERENCES "ReOwnedProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessToReOwnedProduct" ADD CONSTRAINT "_BusinessToReOwnedProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessToReOwnedProduct" ADD CONSTRAINT "_BusinessToReOwnedProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "ReOwnedProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
