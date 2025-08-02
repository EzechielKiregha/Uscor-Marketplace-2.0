/*
  Warnings:

  - You are about to drop the column `earnPercentage` on the `RepostedProduct` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenTransactionId]` on the table `AccountRecharge` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessId]` on the table `RepostedProduct` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId]` on the table `RepostedProduct` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `TokenTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TokenTransactionType" AS ENUM ('RELEASE', 'PROFIT_SHARE', 'REPOST_COMMISSION');

-- AlterTable
ALTER TABLE "AccountRecharge" ADD COLUMN     "tokenTransactionId" TEXT;

-- AlterTable
ALTER TABLE "RepostedProduct" DROP COLUMN "earnPercentage",
ADD COLUMN     "markupPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.02;

-- AlterTable
ALTER TABLE "TokenTransaction" ADD COLUMN     "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isReleased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "repostedProductId" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "TokenTransactionType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AccountRecharge_tokenTransactionId_key" ON "AccountRecharge"("tokenTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "RepostedProduct_businessId_key" ON "RepostedProduct"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "RepostedProduct_productId_key" ON "RepostedProduct"("productId");

-- AddForeignKey
ALTER TABLE "TokenTransaction" ADD CONSTRAINT "TokenTransaction_repostedProductId_fkey" FOREIGN KEY ("repostedProductId") REFERENCES "RepostedProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountRecharge" ADD CONSTRAINT "AccountRecharge_tokenTransactionId_fkey" FOREIGN KEY ("tokenTransactionId") REFERENCES "TokenTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
