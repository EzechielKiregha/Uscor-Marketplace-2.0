-- CreateTable
CREATE TABLE "PaymentConfig" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "mtnCode" TEXT,
    "airtelCode" TEXT,
    "orangeCode" TEXT,
    "mpesaCode" TEXT,
    "bankAccount" TEXT,
    "mobileMoneyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HardwareConfig" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "receiptPrinter" TEXT,
    "barcodeScanner" TEXT,
    "cashDrawer" TEXT,
    "cardReader" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HardwareConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "isCurrentPlan" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingFeature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "planId" TEXT NOT NULL,

    CONSTRAINT "PricingFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HardwareRecommendation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "model" TEXT,
    "description" TEXT,
    "priceRange" TEXT,
    "localSupplier" TEXT,
    "setupGuideUrl" TEXT,
    "businessType" TEXT,
    "country" "Country",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HardwareRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,

    CONSTRAINT "BusinessType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentConfig_businessId_key" ON "PaymentConfig"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "HardwareConfig_businessId_key" ON "HardwareConfig"("businessId");

-- AddForeignKey
ALTER TABLE "PaymentConfig" ADD CONSTRAINT "PaymentConfig_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HardwareConfig" ADD CONSTRAINT "HardwareConfig_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingFeature" ADD CONSTRAINT "PricingFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PricingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
