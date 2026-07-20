"use client";

import { Building2, CreditCard, Phone, Smartphone } from "lucide-react";

interface PaymentConfig {
  mtnCode?: string;
  airtelCode?: string;
  orangeCode?: string;
  mpesaCode?: string;
  bankAccount?: string;
  mobileMoneyEnabled?: boolean;
}

interface BusinessPaymentCodesProps {
  businessName: string;
  businessAvatar?: string;
  paymentConfig?: PaymentConfig | null;
  amount?: number;
  compact?: boolean;
}

export default function BusinessPaymentCodes({
  businessName,
  businessAvatar,
  paymentConfig,
  amount,
  compact = false,
}: BusinessPaymentCodesProps) {
  if (!paymentConfig) return null;

  const codes = [
    { label: "MTN Money", code: paymentConfig.mtnCode, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    { label: "Airtel Money", code: paymentConfig.airtelCode, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
    { label: "Orange Money", code: paymentConfig.orangeCode, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { label: "M-Pesa", code: paymentConfig.mpesaCode, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
  ].filter((c) => c.code);

  const hasBank = !!paymentConfig.bankAccount;
  const hasCodes = codes.length > 0 || hasBank;

  if (!hasCodes) return null;

  return (
    <div className={`border border-border rounded-lg overflow-hidden ${compact ? "p-3" : "p-4"}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {businessAvatar ? (
          <img
            src={businessAvatar}
            alt={businessName}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-3.5 w-3.5 text-primary" />
          </div>
        )}
        <div>
          <p className={`font-medium ${compact ? "text-xs" : "text-sm"}`}>{businessName}</p>
          <p className="text-[10px] text-muted-foreground">Direct Payment Codes</p>
        </div>
      </div>

      {/* MoMo Codes */}
      {codes.length > 0 && (
        <div className={`space-y-1.5 ${compact ? "text-xs" : "text-sm"}`}>
          {codes.map((c) => (
            <div
              key={c.label}
              className={`flex items-center justify-between rounded-md px-2.5 py-1.5 ${c.bg}`}
            >
              <div className="flex items-center gap-2">
                <Smartphone className={`h-3.5 w-3.5 ${c.color}`} />
                <span className={`font-medium ${c.color}`}>{c.label}</span>
              </div>
              <span className="font-mono font-bold text-foreground">
                {amount
                  ? c.code?.replace("{amount}", amount.toFixed(2))
                  : c.code}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Bank Account */}
      {hasBank && (
        <div className="flex items-center justify-between rounded-md px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 mt-1.5">
          <div className="flex items-center gap-2">
            <CreditCard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className={`font-medium text-blue-600 dark:text-blue-400 ${compact ? "text-xs" : "text-sm"}`}>
              Bank Transfer
            </span>
          </div>
          <span className={`font-mono font-bold text-foreground ${compact ? "text-xs" : "text-sm"}`}>
            {paymentConfig.bankAccount}
          </span>
        </div>
      )}

      {/* USSD Tip */}
      {amount && (
        <div className="mt-2 flex items-start gap-1.5 text-[10px] text-muted-foreground">
          <Phone className="h-3 w-3 mt-0.5 shrink-0" />
          <span>
            Dial any code above on your phone to pay ${amount.toFixed(2)} directly to {businessName}.
            Or use USCOR Secure Payment for unified checkout.
          </span>
        </div>
      )}
    </div>
  );
}
