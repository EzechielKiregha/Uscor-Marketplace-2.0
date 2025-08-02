-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PostTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED');

-- CreateTable
CREATE TABLE "PostOfSale" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostOfSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTransaction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "paymentTransactionId" TEXT,
    "status" "PostTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MediaToPostOfSale" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MediaToPostOfSale_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MediaToPostOfSale_B_index" ON "_MediaToPostOfSale"("B");

-- AddForeignKey
ALTER TABLE "PostOfSale" ADD CONSTRAINT "PostOfSale_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTransaction" ADD CONSTRAINT "PostTransaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "PostOfSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTransaction" ADD CONSTRAINT "PostTransaction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTransaction" ADD CONSTRAINT "PostTransaction_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "PaymentTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToPostOfSale" ADD CONSTRAINT "_MediaToPostOfSale_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToPostOfSale" ADD CONSTRAINT "_MediaToPostOfSale_B_fkey" FOREIGN KEY ("B") REFERENCES "PostOfSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
