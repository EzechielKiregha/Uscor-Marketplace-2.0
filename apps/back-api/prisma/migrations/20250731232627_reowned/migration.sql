/*
  Warnings:

  - Added the required column `agreementDate` to the `ReOwnedProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "hasAgreedToTerms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isB2BEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "termsAgreedAt" TIMESTAMP(3),
ADD COLUMN     "totalProductsSold" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "isSecure" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "negotiationType" TEXT;

-- AlterTable
ALTER TABLE "ReOwnedProduct" ADD COLUMN     "agreementDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;
