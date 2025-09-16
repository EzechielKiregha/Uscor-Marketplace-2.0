-- Add new columns to AccountRecharge for status, transactionDate, qrCode
ALTER TABLE "AccountRecharge"
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "qrCode" TEXT;