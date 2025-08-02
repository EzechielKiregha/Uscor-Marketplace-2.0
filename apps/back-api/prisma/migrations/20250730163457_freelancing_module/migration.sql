/*
  Warnings:

  - You are about to drop the `_BusinessOrders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_WorkerServices` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[freelanceOrderId]` on the table `PaymentTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('HELD', 'RELEASED', 'DISPUTED');

-- AlterEnum
ALTER TYPE "FreelanceStatus" ADD VALUE 'CONFIRMED';

-- DropForeignKey
ALTER TABLE "_BusinessOrders" DROP CONSTRAINT "_BusinessOrders_A_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessOrders" DROP CONSTRAINT "_BusinessOrders_B_fkey";

-- DropForeignKey
ALTER TABLE "_WorkerServices" DROP CONSTRAINT "_WorkerServices_A_fkey";

-- DropForeignKey
ALTER TABLE "_WorkerServices" DROP CONSTRAINT "_WorkerServices_B_fkey";

-- AlterTable
ALTER TABLE "FreelanceOrder" ADD COLUMN     "escrowReleasedAt" TIMESTAMP(3),
ADD COLUMN     "escrowStatus" "EscrowStatus" DEFAULT 'HELD';

-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN     "freelanceOrderId" TEXT;

-- DropTable
DROP TABLE "_BusinessOrders";

-- DropTable
DROP TABLE "_WorkerServices";

-- CreateTable
CREATE TABLE "WorkerServiceAssignment" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "freelanceServiceId" TEXT NOT NULL,
    "role" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerServiceAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelanceOrderBusiness" (
    "id" TEXT NOT NULL,
    "freelanceOrderId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "role" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreelanceOrderBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_freelanceOrderId_key" ON "PaymentTransaction"("freelanceOrderId");

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_freelanceOrderId_fkey" FOREIGN KEY ("freelanceOrderId") REFERENCES "FreelanceOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerServiceAssignment" ADD CONSTRAINT "WorkerServiceAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerServiceAssignment" ADD CONSTRAINT "WorkerServiceAssignment_freelanceServiceId_fkey" FOREIGN KEY ("freelanceServiceId") REFERENCES "FreelanceService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelanceOrderBusiness" ADD CONSTRAINT "FreelanceOrderBusiness_freelanceOrderId_fkey" FOREIGN KEY ("freelanceOrderId") REFERENCES "FreelanceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelanceOrderBusiness" ADD CONSTRAINT "FreelanceOrderBusiness_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
