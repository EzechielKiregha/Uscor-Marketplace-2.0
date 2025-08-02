/*
  Warnings:

  - You are about to drop the column `businessId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `workerId` on the `Chat` table. All the data in the column will be lost.
  - The `negotiationType` column on the `Chat` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "NegotiationType" AS ENUM ('REOWNERSHIP', 'FREELANCEORDER', 'PURCHASE', 'GENERAL');

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_productId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_workerId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "businessId",
DROP COLUMN "clientId",
DROP COLUMN "workerId",
ADD COLUMN     "serviceId" TEXT,
ALTER COLUMN "productId" DROP NOT NULL,
DROP COLUMN "negotiationType",
ADD COLUMN     "negotiationType" "NegotiationType";

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "clientId" TEXT,
    "businessId" TEXT,
    "workerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "FreelanceService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
