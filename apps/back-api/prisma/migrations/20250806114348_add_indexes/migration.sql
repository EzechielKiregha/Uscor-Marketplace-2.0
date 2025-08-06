-- CreateTable
CREATE TABLE "StripeCustomer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "striperCustomerId" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomer_userId_key" ON "StripeCustomer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomer_striperCustomerId_key" ON "StripeCustomer"("striperCustomerId");

-- CreateIndex
CREATE INDEX "AccountRecharge_createdAt_idx" ON "AccountRecharge"("createdAt");

-- CreateIndex
CREATE INDEX "AccountRecharge_origin_idx" ON "AccountRecharge"("origin");

-- CreateIndex
CREATE INDEX "Ad_productId_idx" ON "Ad"("productId");

-- CreateIndex
CREATE INDEX "Ad_businessId_idx" ON "Ad"("businessId");

-- CreateIndex
CREATE INDEX "Business_createdAt_idx" ON "Business"("createdAt");

-- CreateIndex
CREATE INDEX "Business_email_idx" ON "Business"("email");

-- CreateIndex
CREATE INDEX "Chat_createdAt_idx" ON "Chat"("createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_chatId_createdAt_idx" ON "ChatMessage"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatParticipant_businessId_idx" ON "ChatParticipant"("businessId");

-- CreateIndex
CREATE INDEX "ChatParticipant_clientId_idx" ON "ChatParticipant"("clientId");

-- CreateIndex
CREATE INDEX "Client_createdAt_idx" ON "Client"("createdAt");

-- CreateIndex
CREATE INDEX "Client_id_idx" ON "Client"("id");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "Client"("email");

-- CreateIndex
CREATE INDEX "FreelanceOrder_createdAt_idx" ON "FreelanceOrder"("createdAt");

-- CreateIndex
CREATE INDEX "FreelanceService_createdAt_idx" ON "FreelanceService"("createdAt");

-- CreateIndex
CREATE INDEX "FreelanceService_businessId_idx" ON "FreelanceService"("businessId");

-- CreateIndex
CREATE INDEX "FreelanceService_category_idx" ON "FreelanceService"("category");

-- CreateIndex
CREATE INDEX "Order_clientId_idx" ON "Order"("clientId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderProduct_orderId_idx" ON "OrderProduct"("orderId");

-- CreateIndex
CREATE INDEX "OrderProduct_productId_idx" ON "OrderProduct"("productId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_createdAt_idx" ON "PaymentTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "Product_businessId_idx" ON "Product"("businessId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_price_idx" ON "Product"("price");

-- CreateIndex
CREATE INDEX "Product_stock_idx" ON "Product"("stock");

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- CreateIndex
CREATE INDEX "Product_title_idx" ON "Product"("title");

-- CreateIndex
CREATE INDEX "PurchaseOrder_storeId_idx" ON "PurchaseOrder"("storeId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_createdAt_idx" ON "PurchaseOrder"("createdAt");

-- CreateIndex
CREATE INDEX "ReOwnedProduct_createdAt_idx" ON "ReOwnedProduct"("createdAt");

-- CreateIndex
CREATE INDEX "Referral_createdAt_idx" ON "Referral"("createdAt");

-- CreateIndex
CREATE INDEX "RepostedProduct_createdAt_idx" ON "RepostedProduct"("createdAt");

-- CreateIndex
CREATE INDEX "Sale_storeId_idx" ON "Sale"("storeId");

-- CreateIndex
CREATE INDEX "Sale_workerId_idx" ON "Sale"("workerId");

-- CreateIndex
CREATE INDEX "Sale_createdAt_idx" ON "Sale"("createdAt");

-- CreateIndex
CREATE INDEX "SaleProduct_saleId_idx" ON "SaleProduct"("saleId");

-- CreateIndex
CREATE INDEX "SaleProduct_productId_idx" ON "SaleProduct"("productId");

-- CreateIndex
CREATE INDEX "Shift_storeId_idx" ON "Shift"("storeId");

-- CreateIndex
CREATE INDEX "Shift_workerId_idx" ON "Shift"("workerId");

-- CreateIndex
CREATE INDEX "Shift_createdAt_idx" ON "Shift"("createdAt");

-- CreateIndex
CREATE INDEX "Shipping_createdAt_id_idx" ON "Shipping"("createdAt", "id");

-- CreateIndex
CREATE INDEX "TokenTransaction_createdAt_idx" ON "TokenTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "TransferOrder_fromStoreId_idx" ON "TransferOrder"("fromStoreId");

-- CreateIndex
CREATE INDEX "TransferOrder_toStoreId_idx" ON "TransferOrder"("toStoreId");

-- CreateIndex
CREATE INDEX "TransferOrder_createdAt_idx" ON "TransferOrder"("createdAt");

-- CreateIndex
CREATE INDEX "Worker_id_idx" ON "Worker"("id");

-- CreateIndex
CREATE INDEX "Worker_email_idx" ON "Worker"("email");
