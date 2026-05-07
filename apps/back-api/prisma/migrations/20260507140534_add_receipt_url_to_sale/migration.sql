-- AlterEnum
ALTER TYPE "MediaType" ADD VALUE 'DOCUMENT';

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "receiptUrl" TEXT;
