/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `Worker` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `Business` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Worker` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Business" ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "Worker" ALTER COLUMN "phone" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Business_phone_key" ON "Business"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Client_phone_key" ON "Client"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_phone_key" ON "Worker"("phone");
