async generateReceipt(input: GenerateReceiptInput, user: AuthPayload) {
        const { saleId, email } = input;

        const sale = await this.prisma.sale.findUnique({
            where: { id: saleId },
            include: {
                store: {
                    include: {
                        business: true,
                    },
                },
                worker: true,
                client: true,
                saleProducts: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!sale) throw new Error("Sale not found");

        const qrData =
            "https://uscor-marketplace-2-0-front-ui.vercel.app/sale-status?id=" + sale.id || "";
        const qrBase64 = await QRCode.toDataURL(qrData);

        // Verify store access
        await this.verifyStoreAccess(sale.storeId, user);

        if (user.role === "WORKER" && sale.workerId !== user.id) {
            throw new Error("Workers can only generate receipts for their own sales");
        }

        // Calculate loyalty points if applicable
        let pointsEarned = 0;
        if (sale.clientId) {
            const loyaltyProgram = await this.prisma.loyaltyProgram.findFirst({
                where: {
                    businessId: sale.store.businessId,
                },
            });
            if (loyaltyProgram) {
                // Assuming pointsPerPurchase is the multiplier (e.g., 0.1 for 10% back as points)
                pointsEarned = sale.totalAmount * loyaltyProgram.pointsPerPurchase;
            }
        }

        // Generate HTML receipt
        const html = this.generateReceiptHTML(sale, pointsEarned, qrBase64);

        // Generate PDF Buffer in memory using Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"], // Important for deployment environments like Vercel
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20px",
                bottom: "20px",
                left: "20px",
                right: "20px",
            },
        });

        await browser.close();

        // Prepare filename for Vercel Blob
        const fileName = `receipt_${sale.id.substring(0, 8)}_${Date.now()}.pdf`;

        // Upload PDF buffer to Vercel Blob
        const blobToken = this.configService.get<string>(
            "NEST_PUBLIC_BLOB_READ_WRITE_TOKEN",
        ); // Ensure this is set in your environment
        if (!blobToken) {
            this.logger.error(
                "NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN is missing in environment variables.",
            );
            throw new Error(
                "Blob upload configuration error. Please contact support.",
            );
        }

        const blob = await put(`receipts/${fileName}`, Buffer.from(pdfBuffer), {
            access: "public", // Make the receipt publicly accessible via the URL
            contentType: "application/pdf", // Explicitly set the content type
            token: blobToken,
        });

        // Create a Media record to store the receipt metadata
        const mediaRecord = await this.prisma.media.create({
            data: {
                url: blob.url,
                type: "DOCUMENT",
                size: BigInt(pdfBuffer.length),
                pathname: blob.pathname,
                storeId: sale.storeId,
                businessId: sale.store.businessId,
            },
        });

        // Update the Sale record with the receipt URL
        await this.prisma.sale.update({
            where: { id: saleId },
            data: {
                receiptUrl: blob.url,
            },
        });

        // Send email if provided (logic remains the same, now using the public URL)
        let emailSent = false;
        if (email && sale.client?.email) {
            try {
                // In a real app, integrate with your email service (e.g., SendGrid, Nodemailer)
                console.log(
                    `Simulated sending receipt email to ${email} with URL: ${blob.url}`,
                );
                // Example: await this.emailService.sendReceipt(email, blob.url, sale);
                emailSent = true;
            } catch (emailError) {
                this.logger.error(
                    `Failed to send email receipt to ${email}`,
                    emailError,
                );
                emailSent = false;
            }
        }

        // Return the public URL and email status
        return {
            receiptUrl: blob.url, // Return the public URL instead of a local path
            emailSent,
            fileName, // Optionally return filename if needed elsewhere
            mediaId: mediaRecord.id, // Return the ID of the created Media record
        };
    }

    private generateReceiptHTML(
        sale: any,
        pointsEarned: number,
        qrBase64: any,
    ): string {
        // Format business type with appropriate icon
        const getBusinessTypeIcon = (type: string) => {
            switch (type) {
                case "ARTISAN":
                    return "🎨";
                case "BOOKSTORE":
                    return "📚";
                case "ELECTRONICS":
                    return "🔌";
                case "HARDWARE":
                    return "🔨";
                case "GROCERY":
                    return "🛒";
                case "CAFE":
                    return "☕";
                case "RESTAURANT":
                    return "🍽️";
                case "RETAIL":
                    return "🏬";
                case "BAR":
                    return "🍷";
                case "CLOTHING":
                    return "👕";
                default:
                    return "🏢";
            }
        };

        // Format payment method
        const formatPaymentMethod = (method: string) => {
            switch (method) {
                case "MOBILE_MONEY":
                    return "📱 Mobile Money";
                case "CASH":
                    return "💵 Cash";
                case "CARD":
                    return "💳 Card";
                case "TOKEN":
                    return "🪙 USCOR Token";
                default:
                    return method;
            }
        };

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${sale.id.substring(0, 8)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #ffffff;
      color: #1f2937;
      line-height: 1.5;
      padding: 20px;
    }
    
    .receipt-container {
      max-width: 400px;
      margin: 0 auto;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    
    .receipt-header {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      padding: 20px;
      text-align: center;
      position: relative;
    }
    
    .business-logo {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 10px;
      font-size: 24px;
    }
    
    .business-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .business-type {
      font-size: 14px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    
    .receipt-title {
      font-size: 16px;
      font-weight: 600;
      margin-top: 15px;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .receipt-meta {
      background: #f9fafb;
      padding: 15px 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .meta-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .meta-label {
      color: #6b7280;
      font-weight: 500;
    }
    
    .meta-value {
      color: #1f2937;
      font-weight: 500;
    }
    
    .items-section {
      padding: 20px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .items-list {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 15px;
    }
    
    .item-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .item-name {
      flex: 2;
      color: #1f2937;
    }
    
    .item-quantity {
      flex: 1;
      text-align: center;
      color: #6b7280;
    }
    
    .item-price {
      flex: 1;
      text-align: right;
      color: #1f2937;
      font-weight: 500;
    }
    
    .modifiers {
      font-size: 12px;
      color: #9ca3af;
      margin-left: 20px;
    }
    
    .totals-section {
      padding: 20px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .total-label {
      color: #6b7280;
    }
    
    .total-value {
      color: #1f2937;
      font-weight: 500;
    }
    
    .grand-total {
      border-top: 2px solid #e5e7eb;
      padding-top: 10px;
      margin-top: 10px;
    }
    
    .grand-total-label {
      color: #1f2937;
      font-weight: 600;
      font-size: 16px;
    }
    
    .grand-total-value {
      color: #f97316;
      font-weight: bold;
      font-size: 18px;
    }
    
    .loyalty-section {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 8px;
      padding: 15px;
      margin: 20px;
      text-align: center;
    }
    
    .loyalty-title {
      font-weight: 600;
      color: #d97706;
      margin-bottom: 5px;
    }
    
    .loyalty-points {
      font-size: 18px;
      font-weight: bold;
      color: #d97706;
    }
    
    .footer {
      padding: 20px;
      text-align: center;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
    
    .usc-logo {
      margin-bottom: 10px;
      font-size: 24px;
      color: #f97316;
    }
    
    .thank-you {
      font-weight: 500;
      margin-bottom: 5px;
    }
    
    .qr-code {
      margin-top: 15px;
      text-align: center;
    }
    
    .qr-placeholder {
      width: 100px;
      height: 100px;
      background: #e5e7eb;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- Header -->
    <div class="receipt-header">
      <div class="business-logo">
        ${getBusinessTypeIcon(sale.store.business.businessType)}
      </div>
      <div class="business-name">${sale.store.business.name}</div>
      <div class="business-type">
        ${getBusinessTypeIcon(sale.store.business.businessType)} 
        ${
                    sale.store.business.businessType === "ARTISAN"
                        ? "Artisan & Handcrafted Goods"
                        : sale.store.business.businessType === "BOOKSTORE"
                            ? "Bookstore & Stationery"
                            : sale.store.business.businessType === "ELECTRONICS"
                                ? "Electronics & Gadgets"
                                : sale.store.business.businessType === "HARDWARE"
                                    ? "Hardware & Tools"
                                    : sale.store.business.businessType === "GROCERY"
                                        ? "Grocery & Convenience"
                                        : sale.store.business.businessType === "CAFE"
                                            ? "Café & Coffee Shops"
                                            : sale.store.business.businessType === "RESTAURANT"
                                                ? "Restaurant & Dining"
                                                : sale.store.business.businessType === "RETAIL"
                                                    ? "Retail & General Stores"
                                                    : sale.store.business.businessType === "BAR"
                                                        ? "Bar & Pub"
                                                        : sale.store.business.businessType === "CLOTHING"
                                                            ? "Clothing & Accessories"
                                                            : sale.store.business.businessType
                }
      </div>
      <div class="receipt-title">RECEIPT #${sale.id.substring(0, 8)}</div>
    </div>
    
    <!-- Metadata -->
    <div class="receipt-meta">
      <div class="meta-item">
        <span class="meta-label">Store</span>
        <span class="meta-value">${sale.store.name}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Date</span>
        <span class="meta-value">${new Date(sale.createdAt).toLocaleDateString(
                    "en-US",
                    {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    },
                )}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Cashier</span>
        <span class="meta-value">${sale.worker?.fullName || "N/A"}</span>
      </div>
      ${
                sale.client
                    ? `
      <div class="meta-item">
        <span class="meta-label">Customer</span>
        <span class="meta-value">${sale.client.fullName}</span>
      </div>`
                    : ""
            }
    </div>
    
    <!-- Items -->
    <div class="items-section">
      <div class="section-title">Items Purchased</div>
      <div class="items-list">
        ${sale.saleProducts
                    .map(
                        (sp: any) => `
          <div class="item-row">
            <div class="item-name">${sp.product.title}</div>
            <div class="item-quantity">×${sp.quantity}</div>
            <div class="item-price">$${(sp.price * sp.quantity).toFixed(2)}</div>
          </div>
          ${sp.modifiers ? `<div class="modifiers">(${sp.modifiers})</div>` : ""}
        `,
                    )
                    .join("")}
      </div>
      
      <div class="totals-section">
        <div class="total-row">
          <span class="total-label">Subtotal</span>
          <span class="total-value">$${sale.totalAmount.toFixed(2)}</span>
        </div>
        ${
                    sale.discount > 0
                        ? `
        <div class="total-row">
          <span class="total-label">Discount</span>
          <span class="total-value">-$${sale.discount.toFixed(2)}</span>
        </div>`
                        : ""
                }
        <div class="total-row">
          <span class="total-label">Tax</span>
          <span class="total-value">$${(sale.totalAmount * 0.18).toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
          <span class="total-label grand-total-label">TOTAL</span>
          <span class="total-value grand-total-value">$${(sale.totalAmount - sale.discount + sale.totalAmount * 0.18).toFixed(2)}</span>
        </div>
        
        <div class="total-row">
          <span class="total-label">Payment Method</span>
          <span class="total-value">${formatPaymentMethod(sale.paymentMethod)}</span>
        </div>
      </div>
    </div>
    
    <!-- Loyalty Points -->
    ${
            pointsEarned > 0
                ? `
    <div class="loyalty-section">
      <div class="loyalty-title">LOYALTY PROGRAM</div>
      <div>You earned</div>
      <div class="loyalty-points">${pointsEarned.toFixed(2)} points</div>
      <div>on this purchase</div>
    </div>`
                : ""
        }
    
    <!-- Footer -->
    <div class="footer">
      <div class="usc-logo">Uscor Marketplace</div>
      <div class="thank-you">Thank you for your business!</div>
      <div>Visit us at www.uscor.rw</div>
      <div>+250 788 123 456</div>
      
      <div class="qr-code">
        <div class="qr-placeholder">
            <img src="${qrBase64}" width="120" />
        </div>
        <div>Scan to Check Sale Status</div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
    }