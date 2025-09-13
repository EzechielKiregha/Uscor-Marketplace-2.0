import React from "react";

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

export default function PaymentCode({
  productOwnerCodes, country, provider, amount
}: PaymentCodeProps) {

  const [paymentCode, setPaymentCode] = React.useState<string | null | undefined>(null);

  React.useEffect(() => {
    const code = generatePaymentCode(productOwnerCodes, country, provider, amount);
    setPaymentCode(code);
  }, [productOwnerCodes, country, provider, amount]);

  return (
    <span>{paymentCode || 'Generating code...'}</span>
  );

  function generatePaymentCode(
    productOwnerCodes: PaymentCodeProps['productOwnerCodes'],
    country: string,
    provider: string,
    amount: string | number
  ) {
    switch (provider) {
      case 'MTN_MONEY':
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

    // 👇 fallback (important!)
    return 'No code available for this provider/country';
  }

}
