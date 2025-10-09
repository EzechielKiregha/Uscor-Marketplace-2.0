// app/business/settings/_components/PaymentConfiguration.tsx
'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_PAYMENT_CONFIG } from '@/graphql/settings.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CreditCard,
  Phone,
  Landmark,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Copy
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMe } from '@/lib/useMe';
import { GET_BUSINESS_BY_ID } from '@/graphql/business.gql';
import Loader from '@/components/seraui/Loader';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface PaymentCodeProps {
  productOwnerCodes: {
    AIRTEL_MONEY: string,
    MTN_MOMO: string,
    ORANGE_MONEY: string,
    M_PESA: string,
  },
  country: string,
  provider: string,
  amount: string | number,
}

function PaymentCode({
  productOwnerCodes, country, provider, amount
}: PaymentCodeProps) {
  const [paymentCode, setPaymentCode] = useState<string | null | undefined>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const code = generatePaymentCode(productOwnerCodes, country, provider, amount);
    setPaymentCode(code);
  }, [productOwnerCodes, country, provider, amount]);

  return (
    <div className="bg-muted p-3 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-mono text-sm">{paymentCode || 'Generating code...'}</span>
        {paymentCode && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(paymentCode);
              showToast('success', 'Copied!', 'Payment code copied to clipboard');
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Customers will see this code at checkout to complete payment
      </p>
    </div>
  );

  function generatePaymentCode(
    productOwnerCodes: PaymentCodeProps['productOwnerCodes'],
    country: string,
    provider: string,
    amount: string | number
  ) {
    switch (provider) {
      case 'MTN_MOMO':
        if (country === 'RWANDA')
          return `*182*8*1*${productOwnerCodes.MTN_MOMO}*${amount}#`;
        if (country === 'UGANDA')
          return `*165*1*${productOwnerCodes.MTN_MOMO}*${amount}#`;
        if (['DRC', 'BURUNDI', 'KENYA', 'TANZANIA'].includes(country))
          return `${productOwnerCodes.MTN_MOMO} (Dial main MTN MoMo USSD, follow prompts)`;
        break;

      case 'AIRTEL_MONEY':
        if (country === 'RWANDA')
          return `*500*1*${productOwnerCodes.AIRTEL_MONEY}*${amount}#`;
        if (country === 'UGANDA')
          return `*185*1*${productOwnerCodes.AIRTEL_MONEY}*${amount}#`;
        if (country === 'TANZANIA')
          return `*150*60*${productOwnerCodes.AIRTEL_MONEY}*${amount}#`;
        if (['DRC', 'BURUNDI', 'KENYA'].includes(country))
          return `${productOwnerCodes.AIRTEL_MONEY} (Dial main Airtel Money USSD, follow prompts)`;
        break;

      case 'ORANGE_MONEY':
        if (country === 'DRC')
          return `*145*1*${productOwnerCodes.ORANGE_MONEY}*${amount}#`;
        if (['RWANDA', 'UGANDA', 'KENYA', 'TANZANIA', 'BURUNDI'].includes(country))
          return `${productOwnerCodes.ORANGE_MONEY} (Dial Orange Money USSD, follow prompts)`;
        break;

      case 'MPESA':
        if (country === 'KENYA')
          return `*334*1*${productOwnerCodes.M_PESA}*${amount}#`;
        if (country === 'TANZANIA')
          return `*150*00*${productOwnerCodes.M_PESA}*${amount}#`;
        if (['DRC', 'UGANDA', 'RWANDA', 'BURUNDI'].includes(country))
          return `${productOwnerCodes.M_PESA} (Dial M-Pesa USSD, follow prompts)`;
        break;
    }

    // Fallback
    return 'No code available for this provider/country';
  }
}

interface PaymentConfigurationProps {
  // Optional props if needed
}

export default function PaymentConfiguration({ }: PaymentConfigurationProps) {
  const { user, loading: authLoading } = useMe();
  const [formData, setFormData] = useState({
    mobileMoneyEnabled: true,
    mtnCode: '',
    airtelCode: '',
    orangeCode: '',
    mpesaCode: '',
    bankAccount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testAmount, setTestAmount] = useState(1000);
  const { showToast } = useToast();

  const [updatePaymentConfig] = useMutation(UPDATE_PAYMENT_CONFIG);

  const { data: businessData } = useQuery(GET_BUSINESS_BY_ID, {
    variables: { userId: user?.id },
    skip: !user?.id
  })

  useEffect(() => {
    if (businessData?.paymentConfig) {
      setFormData({
        mobileMoneyEnabled: businessData.paymentConfig.mobileMoneyEnabled,
        mtnCode: businessData.paymentConfig.mtnCode || '',
        airtelCode: businessData.paymentConfig.airtelCode || '',
        orangeCode: businessData.paymentConfig.orangeCode || '',
        mpesaCode: businessData.paymentConfig.mpesaCode || '',
        bankAccount: businessData.paymentConfig.bankAccount || ''
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLTextAreaElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updatePaymentConfig({
        variables: {
          businessId: user?.id,
          input: {
            mobileMoneyEnabled: formData.mobileMoneyEnabled,
            mtnCode: formData.mtnCode,
            airtelCode: formData.airtelCode,
            orangeCode: formData.orangeCode,
            mpesaCode: formData.mpesaCode,
            bankAccount: formData.bankAccount
          }
        }
      });

      showToast('success', 'Success', 'Payment configuration updated successfully');
    } catch (error) {
      showToast('error', 'Error', 'Failed to update payment configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return (
    <Card>
      <CardContent className="h-[500px] flex items-center justify-center">
        <Loader loading={true} />
      </CardContent>
    </Card>
  );

  const country = businessData?.country || 'RWANDA';
  const businessType = businessData?.businessType || 'ARTISAN';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Configuration
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Set up payment methods for your business
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Payment History</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mobile Money Section */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Mobile Money
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure mobile money payment options for your customers
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Enable</span>
                <Switch
                  checked={formData.mobileMoneyEnabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mobileMoneyEnabled: checked }))}
                />
              </div>
            </div>

            {formData.mobileMoneyEnabled && (
              <div className="pl-2 border-l border-border space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="mtnCode" className="block text-sm font-medium mb-1">
                      MTN Mobile Money Code
                    </label>
                    <Input
                      id="mtnCode"
                      name="mtnCode"
                      value={formData.mtnCode}
                      onChange={handleInputChange}
                      placeholder="e.g., 0788123456"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your MTN Mobile Money number for receiving payments
                    </p>
                  </div>

                  <div>
                    <label htmlFor="airtelCode" className="block text-sm font-medium mb-1">
                      Airtel Money Code
                    </label>
                    <Input
                      id="airtelCode"
                      name="airtelCode"
                      value={formData.airtelCode}
                      onChange={handleInputChange}
                      placeholder="e.g., 0738123456"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your Airtel Money number for receiving payments
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="orangeCode" className="block text-sm font-medium mb-1">
                      Orange Money Code
                    </label>
                    <Input
                      id="orangeCode"
                      name="orangeCode"
                      value={formData.orangeCode}
                      onChange={handleInputChange}
                      placeholder="e.g., 0778123456"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your Orange Money number for receiving payments
                    </p>
                  </div>

                  <div>
                    <label htmlFor="mpesaCode" className="block text-sm font-medium mb-1">
                      M-Pesa Code
                    </label>
                    <Input
                      id="mpesaCode"
                      name="mpesaCode"
                      value={formData.mpesaCode}
                      onChange={handleInputChange}
                      placeholder="e.g., 0722123456"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your M-Pesa number for receiving payments (Kenya/Tanzania)
                    </p>
                  </div>
                </div>

                {/* Payment Code Preview */}
                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Payment Code Preview</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    See how your payment code will appear to customers at checkout
                  </p>

                  <div className="space-y-4">
                    {formData.mtnCode && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#F9A825] flex items-center justify-center text-white">
                            <Phone className="h-4 w-4" />
                          </div>
                          <span className="font-medium">MTN Mobile Money</span>
                        </div>
                        <PaymentCode
                          productOwnerCodes={{
                            AIRTEL_MONEY: formData.airtelCode,
                            MTN_MOMO: formData.mtnCode,
                            ORANGE_MONEY: formData.orangeCode,
                            M_PESA: formData.mpesaCode
                          }}
                          country={country}
                          provider="MTN_MOMO"
                          amount={testAmount}
                        />
                      </div>
                    )}

                    {formData.airtelCode && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#E60012] flex items-center justify-center text-white">
                            <Phone className="h-4 w-4" />
                          </div>
                          <span className="font-medium">Airtel Money</span>
                        </div>
                        <PaymentCode
                          productOwnerCodes={{
                            AIRTEL_MONEY: formData.airtelCode,
                            MTN_MOMO: formData.mtnCode,
                            ORANGE_MONEY: formData.orangeCode,
                            M_PESA: formData.mpesaCode
                          }}
                          country={country}
                          provider="AIRTEL_MONEY"
                          amount={testAmount}
                        />
                      </div>
                    )}

                    {formData.orangeCode && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#FF6600] flex items-center justify-center text-white">
                            <Phone className="h-4 w-4" />
                          </div>
                          <span className="font-medium">Orange Money</span>
                        </div>
                        <PaymentCode
                          productOwnerCodes={{
                            AIRTEL_MONEY: formData.airtelCode,
                            MTN_MOMO: formData.mtnCode,
                            ORANGE_MONEY: formData.orangeCode,
                            M_PESA: formData.mpesaCode
                          }}
                          country={country}
                          provider="ORANGE_MONEY"
                          amount={testAmount}
                        />
                      </div>
                    )}

                    {formData.mpesaCode && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#009900] flex items-center justify-center text-white">
                            <Phone className="h-4 w-4" />
                          </div>
                          <span className="font-medium">M-Pesa</span>
                        </div>
                        <PaymentCode
                          productOwnerCodes={{
                            AIRTEL_MONEY: formData.airtelCode,
                            MTN_MOMO: formData.mtnCode,
                            ORANGE_MONEY: formData.orangeCode,
                            M_PESA: formData.mpesaCode
                          }}
                          country={country}
                          provider="MPESA"
                          amount={testAmount}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={testAmount}
                        onChange={(e) => setTestAmount(parseInt(e.target.value) || 1000)}
                        className="w-24"
                        min="1"
                      />
                      <span>test amount (RWF/UGX/KES)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bank Transfer Section */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Landmark className="h-4 w-4" />
              Bank Transfer
            </h3>

            <div className="pl-2 border-l border-border space-y-4">
              <div>
                <label htmlFor="bankAccount" className="block text-sm font-medium mb-1">
                  Bank Account Information
                </label>
                <Textarea
                  id="bankAccount"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  placeholder="Bank Name: Bank of Kigali\nAccount Name: Your Business Name\nAccount Number: 0123456789\nBranch: Nyarugenge"
                  rows={4}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Provide your bank account details for customers who prefer bank transfers
                </p>
              </div>
            </div>
          </div>

          {/* Business Type Benefits */}
          <div className="border border-border rounded-lg p-4 bg-muted">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Payment Tips for {businessType === 'ARTISAN' ? 'Artisans' : businessType}
            </h3>

            <ul className="space-y-2">
              {businessType === 'ARTISAN' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Display your mobile money codes prominently at your workshop or store</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>For custom orders, collect a deposit via mobile money before starting work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Use the payment code preview to train your staff on processing mobile money payments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>For wood workers and artisans, mobile money is preferred for quick, secure transactions</span>
                  </li>
                </>
              )}
              {businessType === 'GROCERY' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Set up multiple mobile money options to accommodate all customer preferences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Display payment codes at checkout counters for quick reference</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>For delivery orders, include payment code instructions in order confirmations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Train all staff on verifying mobile money payments before handing over goods</span>
                  </li>
                </>
              )}
              {businessType === 'CAFE' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Use mobile money for quick transactions during peak hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>For catering orders, collect partial payment via mobile money to secure bookings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Display payment codes on table tents for easy customer reference</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Integrate payment verification into your POS workflow to reduce errors</span>
                  </li>
                </>
              )}
              {businessType === 'RETAIL' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Offer mobile money payment as the default option to speed up checkout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>For high-value items, use mobile money for secure, trackable transactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Train staff to verify payment confirmation before completing sales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Display your payment codes at multiple points in your store for convenience</span>
                  </li>
                </>
              )}
            </ul>

            <div className="mt-4 p-3 bg-background rounded-lg border border-border">
              <p className="text-sm">
                <strong>Pro Tip:</strong> In East Africa, mobile money is the preferred payment method for
                over 80% of transactions. Make sure your payment codes are correctly configured to avoid
                lost sales and frustrated customers.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset form
                setFormData({
                  mobileMoneyEnabled: businessData?.paymentConfig?.mobileMoneyEnabled || true,
                  mtnCode: businessData?.paymentConfig?.mtnCode || '',
                  airtelCode: businessData?.paymentConfig?.airtelCode || '',
                  orangeCode: businessData?.paymentConfig?.orangeCode || '',
                  mpesaCode: businessData?.paymentConfig?.mpesaCode || '',
                  bankAccount: businessData?.paymentConfig?.bankAccount || ''
                });
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-accent text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : 'Save Payment Configuration'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}