import { NextRequest } from 'next/server';
import { GET_BUSINESS_BY_PHONE } from '@/graphql/business.gql';
import { GET_CLIENT_BY_PHONE } from '@/graphql/client.gql';
import { GET_PAYMENT_LATEST_TRANSACTION, UPDATE_PAYMENT_TRANSACTION_FOR_ACCOUNT_RECHARGE } from '@/graphql/payment.gql';
import { CREATE_ACCOUNT_RECHARGE_FROM_USSD, GET_ACCOUNT_BALANCE } from '@/graphql/wallet.gql';
import { client as executeQuery } from "@/lib/apollo-client";
import { BusinessEntity } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCountryFromPhone(phone: string): string {
  if (phone.startsWith('+250') || phone.startsWith('250')) return 'RWANDA';
  if (phone.startsWith('+256') || phone.startsWith('256')) return 'UGANDA';
  if (phone.startsWith('+254') || phone.startsWith('254')) return 'KENYA';
  if (phone.startsWith('+255') || phone.startsWith('255')) return 'TANZANIA';
  if (phone.startsWith('+243') || phone.startsWith('243')) return 'DRC';
  if (phone.startsWith('+257') || phone.startsWith('257')) return 'BURUNDI';
  return 'RWANDA';
}

const METHOD_NAMES = ['MTN_MONEY', 'AIRTEL_MONEY', 'ORANGE_MONEY', 'MPESA'];
const PRESET_AMOUNTS: Record<string, number> = {
  '1': 10000, '2': 25000, '3': 50000, '4': 100000, '5': 200000,
};
const TOKEN_PRESET_AMOUNTS: Record<string, number> = {
  '1': 10, '2': 50, '3': 100, '4': 500, '5': 1000,
};

function end(msg: string) {
  return new Response(`END ${msg}`, { headers: { 'Content-Type': 'text/plain' } });
}
function con(msg: string) {
  return new Response(`CON ${msg}`, { headers: { 'Content-Type': 'text/plain' } });
}

async function resolveUser(phoneNumber: string) {
  const clientResult = await executeQuery.query({
    query: GET_CLIENT_BY_PHONE,
    variables: { phone: phoneNumber },
    fetchPolicy: 'network-only',
  });
  const client = clientResult.data?.clientByPhone ?? null;
  if (client) return { client, business: null };

  const bizResult = await executeQuery.query({
    query: GET_BUSINESS_BY_PHONE,
    variables: { phone: phoneNumber },
    fetchPolicy: 'network-only',
  });
  const business = bizResult.data?.businessByPhone ?? null;
  return { client: null, business };
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const phoneNumber = body.get('phoneNumber') as string;
  const text = (body.get('text') as string) || '';
  const parts = text.split('*');
  const depth = text === '' ? 0 : parts.length;

  const userCountry = getCountryFromPhone(phoneNumber);

  try {

    // ── Step 0: Main menu ──────────────────────────────────────────────────
    if (text === '') {
      return con(`Welcome to USCOR Recharge Service
You are using a ${
  userCountry === 'DRC' ? 'Congolese' :
  userCountry === 'RWANDA' ? 'Rwandan' :
  userCountry === 'UGANDA' ? 'Ugandan' :
  userCountry === 'KENYA' ? 'Kenyan' :
  userCountry === 'TANZANIA' ? 'Tanzanian' : 'East African'
} phone
1. Recharge Account
2. Convert to Tokens
3. Check Balance`);
    }

    // ════════════════════════════════════════════════════════════════════════
    // FLOW 1 — Recharge Account (starts with '1')
    // Order matters: most specific (deepest) first.
    // ════════════════════════════════════════════════════════════════════════

    // 1*<method>*6*<customAmount>*<confirm>  → Step: confirm custom amount
    else if (parts[0] === '1' && depth === 5 && parts[2] === '6') {
      const methodName = METHOD_NAMES[parseInt(parts[1]) - 1];
      const confirmation = parts[4];
      const amount = parseFloat(parts[3]);

      if (confirmation !== '1') return end('❌ Recharge cancelled.');
      if (!methodName) return end('❌ Invalid payment method.');
      if (Number.isNaN(amount) || amount <= 0) return end('❌ Invalid amount.');

      return await doRecharge({ phoneNumber, amount, methodName, userCountry });
    }

    // 1*<method>*<preset>*<confirm>  → Step: confirm preset amount
    else if (parts[0] === '1' && depth === 4 && parts[2] !== '6') {
      const methodName = METHOD_NAMES[parseInt(parts[1]) - 1];
      const confirmation = parts[3];
      const amount = PRESET_AMOUNTS[parts[2]];

      if (confirmation !== '1') return end('❌ Recharge cancelled.');
      if (!methodName) return end('❌ Invalid payment method.');
      if (!amount) return end('❌ Invalid amount option.');

      return await doRecharge({ phoneNumber, amount, methodName, userCountry });
    }

    // 1*<method>*6*<customAmount>  → Step: user just typed custom amount → show confirm
    else if (parts[0] === '1' && depth === 4 && parts[2] === '6') {
      const customAmount = parts[3];

      if (customAmount === '0') {
        // Go back to method selection
        return con(`Recharge Account
Select Payment Method:
1. MTN Money
2. Airtel Money
3. Orange Money
4. M-Pesa`);
      }

      const amount = parseFloat(customAmount);
      if (Number.isNaN(amount) || amount <= 0) return end('❌ Invalid amount. Please enter a positive number.');

      const { client, business } = await resolveUser(phoneNumber);
      if (!client && !business) return end('❌ No account found.');

      const methodName = METHOD_NAMES[parseInt(parts[1]) - 1];
      const label = business ? `Business: ${(business as BusinessEntity).name}` : `Client: ${client!.fullName}`;
      const icon = business ? '🏪' : '💳';

      return con(`${icon} Confirm Recharge
${label}
Amount: RWF ${amount.toLocaleString()} ~ $${(amount / 1500).toFixed(2)}
Method: ${methodName}
Origin: ${userCountry}
1. Confirm
2. Cancel`);
    }

    // 1*<method>*6  → Step: user chose custom amount option → prompt for amount
    else if (parts[0] === '1' && depth === 3 && parts[2] === '6') {
      return con(`📝 Enter custom amount to recharge (in RWF):
Back: 0`);
    }

    // 1*<method>*<preset>  → Step: user chose a preset amount → show confirm
    else if (parts[0] === '1' && depth === 3 && parts[2] !== '6') {
      const methodName = METHOD_NAMES[parseInt(parts[1]) - 1];
      const amount = PRESET_AMOUNTS[parts[2]];

      if (!methodName) return end('❌ Invalid payment method.');
      if (!amount) return end('❌ Invalid amount option.');

      const { client, business } = await resolveUser(phoneNumber);
      if (!client && !business) return end('❌ No account found.');

      const label = business ? `Business: ${(business as BusinessEntity).name}` : `Client: ${client!.fullName}`;
      const icon = business ? '🏪' : '💳';

      return con(`${icon} Confirm Recharge
${label}
Amount: RWF ${amount.toLocaleString()} ~ $${(amount / 1500).toFixed(2)}
Method: ${methodName}
Origin: ${userCountry}
1. Confirm
2. Cancel`);
    }

    // 1*<method>  → Step: user chose Recharge, now pick amount
    else if (parts[0] === '1' && depth === 2) {
      const methodName = METHOD_NAMES[parseInt(parts[1]) - 1];
      if (!methodName) return end('❌ Invalid payment method.');

      const { client, business } = await resolveUser(phoneNumber);
      if (!client && !business) return end('❌ No account found with this phone number. Please register first.');

      const icon = business ? '🏪 Recharge Business Account' : '💳 Recharge Client Account';

      return con(`${icon} with ${methodName.replace(/_/g, ' ')}
Enter amount to recharge:
1. RWF 10,000
2. RWF 25,000
3. RWF 50,000
4. RWF 100,000
5. RWF 200,000
6. Custom amount`);
    }

    // 1  → Step: user chose Recharge → pick payment method
    else if (text === '1') {
      const { client, business } = await resolveUser(phoneNumber);
      if (!client && !business) return end('❌ No account found with this phone number. Please register first.');

      const icon = business ? '🏪 Recharge Business Account' : '💳 Recharge Client Account';
      return con(`${icon}
Select Payment Method:
1. MTN Money
2. Airtel Money
3. Orange Money
4. M-Pesa`);
    }

    // ════════════════════════════════════════════════════════════════════════
    // FLOW 2 — Convert to Tokens (starts with '2')
    // ════════════════════════════════════════════════════════════════════════

    // 2*<option>*<confirm>  → confirm token conversion (preset)
    else if (parts[0] === '2' && depth === 3 && parts[1] !== '6') {
      const option = parts[1];
      const confirmation = parts[2];
      const amount = TOKEN_PRESET_AMOUNTS[option];

      if (confirmation !== '1') return end('❌ Token conversion cancelled.');
      if (!amount) return end('❌ Invalid option.');

      return await doTokenConversion({ phoneNumber, amount, userCountry });
    }

    // 2*6*<customAmount>*<confirm>  → confirm custom token conversion
    else if (parts[0] === '2' && depth === 4 && parts[1] === '6') {
      const confirmation = parts[3];
      const amount = parseFloat(parts[2]);

      if (confirmation !== '1') return end('❌ Token conversion cancelled.');
      if (Number.isNaN(amount) || amount <= 0) return end('❌ Invalid amount.');

      return await doTokenConversion({ phoneNumber, amount, userCountry });
    }

    // 2*6*<customAmount>  → user entered custom amount → show confirm
    else if (parts[0] === '2' && depth === 3 && parts[1] === '6') {
      const customAmount = parts[2];

      if (customAmount === '0') {
        return con(`Convert Recharge to Tokens
1. Convert $10 to 1 uTn
2. Convert $50 to 5 uTn
3. Convert $100 to 10 uTn
4. Convert $500 to 50 uTn
5. Convert $1000 to 100 uTn
6. Custom amount`);
      }

      const amount = parseFloat(customAmount);
      if (Number.isNaN(amount) || amount <= 0) return end('❌ Invalid amount. Please enter a positive number.');

      // Check balance before confirm screen
      const clientResult = await executeQuery.query({
        query: GET_CLIENT_BY_PHONE,
        variables: { phone: phoneNumber },
        fetchPolicy: 'network-only',
      });
      const client = clientResult.data?.clientByPhone;
      if (!client) return end('❌ No account found.');

      const balanceResult = await executeQuery.query({
        query: GET_ACCOUNT_BALANCE,
        variables: { userId: client.id, userType: 'CLIENT' },
      });
      const available = balanceResult?.data?.accountBalance?.availableAmount || 0;
      if (available < amount) return end(`❌ Insufficient balance. You have $${available.toFixed(2)} available.`);

      const tokens = amount / 10;
      return con(`🪙 Confirm Token Conversion
Convert $${amount.toFixed(2)} to ${tokens} uTn
1. Confirm
2. Cancel`);
    }

    // 2*6  → user chose custom token amount → prompt input
    else if (parts[0] === '2' && depth === 2 && parts[1] === '6') {
      return con(`📝 Enter custom amount to convert to tokens (in $):
Back: 0`);
    }

    // 2*<preset>  → user chose a preset token amount → show confirm
    else if (parts[0] === '2' && depth === 2 && parts[1] !== '6') {
      const option = parts[1];
      const amount = TOKEN_PRESET_AMOUNTS[option];
      if (!amount) return end('❌ Invalid option.');

      const clientResult = await executeQuery.query({
        query: GET_CLIENT_BY_PHONE,
        variables: { phone: phoneNumber },
        fetchPolicy: 'network-only',
      });
      const client = clientResult.data?.clientByPhone;
      if (!client) return end('❌ No account found.');

      const balanceResult = await executeQuery.query({
        query: GET_ACCOUNT_BALANCE,
        variables: { userId: client.id, userType: 'CLIENT' },
      });
      const available = balanceResult?.data?.accountBalance?.availableAmount || 0;
      if (available < amount) return end(`❌ Insufficient balance. You have $${available.toFixed(2)} available.`);

      const tokens = amount / 10;
      return con(`🪙 Confirm Token Conversion
Convert $${amount.toFixed(2)} to ${tokens} uTn
Balance after: $${(available - amount).toFixed(2)}
1. Confirm
2. Cancel`);
    }

    // 2  → Convert to Tokens menu
    else if (text === '2') {
      const clientResult = await executeQuery.query({
        query: GET_CLIENT_BY_PHONE,
        variables: { phone: phoneNumber },
        fetchPolicy: 'network-only',
      });
      const client = clientResult.data?.clientByPhone;
      if (!client) return end('❌ Only clients can convert recharge to tokens.');

      const balanceResult = await executeQuery.query({
        query: GET_ACCOUNT_BALANCE,
        variables: { userId: client.id, userType: 'CLIENT' },
      });
      const available = balanceResult?.data?.accountBalance?.availableAmount || 0;

      return con(`🪙 Convert Recharge to Tokens
Available Balance: $${available.toFixed(2)}
1. Convert $10 to 1 uTn
2. Convert $50 to 5 uTn
3. Convert $100 to 10 uTn
4. Convert $500 to 50 uTn
5. Convert $1000 to 100 uTn
6. Custom amount`);
    }

    // ════════════════════════════════════════════════════════════════════════
    // FLOW 3 — Check Balance
    // ════════════════════════════════════════════════════════════════════════

    else if (text === '3') {
      const { client, business } = await resolveUser(phoneNumber);
      if (!client && !business) return end('❌ No account found.');

      const userId = client ? client.id : (business as BusinessEntity).id;
      const userType = client ? 'CLIENT' : 'BUSINESS';
      const icon = client ? '💳 Client' : '🏪 Business';

      const balanceResult = await executeQuery.query({
        query: GET_ACCOUNT_BALANCE,
        variables: { userId, userType },
      });
      const bal = balanceResult?.data?.accountBalance;

      return end(`💰 ${icon} Account Balance
Total: $${bal?.totalAmount?.toFixed(2) || '0.00'}
Available: $${bal?.availableAmount?.toFixed(2) || '0.00'}
Pending: $${bal?.pendingAmount?.toFixed(2) || '0.00'}
USCOR Tokens: ${bal?.tokenBalance?.totalTokens || 0} uTn
Last Updated: ${new Date().toLocaleDateString()}`);
    }

    else {
      return end('❌ Invalid option. Please try again.');
    }

  } catch (error: any) {
    // Log structured details so we can inspect GraphQL server errors
    try {
      console.error('USSD Recharge Error:', {
        message: error?.message,
        graphQLErrors: error?.graphQLErrors,
        networkErrorResult: error?.networkError?.result,
        networkErrorMessage: error?.networkError?.message,
        stack: error?.stack,
      });
    } catch (logErr) {
      console.error('USSD Recharge Error (failed to serialize):', error);
    }

    return end('❌ An error occurred. Please try again later.');
  }
}

// ─── Shared recharge executor ─────────────────────────────────────────────────

async function doRecharge({
  phoneNumber,
  amount,
  methodName,
  userCountry,
}: {
  phoneNumber: string;
  amount: number;
  methodName: string;
  userCountry: string;
}) {
  const { client, business } = await resolveUser(phoneNumber);
  if (!client && !business) return end('❌ No account found.');

  // Verify payment was actually received via MoMo
  const paymentResult = await executeQuery.query({
    query: GET_PAYMENT_LATEST_TRANSACTION,
    variables: { phone: phoneNumber },
    fetchPolicy: 'network-only',
  });
  const latestPayment = paymentResult?.data?.latestPaymentTransaction;

  if (!latestPayment) return end('❌ No payment transaction found. Please complete the MoMo payment first.');
  if (latestPayment.status === 'FAILED') return end('❌ Payment failed due to timeout. Please try again.');

  const rechargeInput = {
    amount: latestPayment.amount,
    method: methodName,
    origin: userCountry,
    ...(client ? { clientId: client.id } : { businessId: (business as BusinessEntity).id }),
  };

  const rechargeResult = await executeQuery.mutate({
    mutation: CREATE_ACCOUNT_RECHARGE_FROM_USSD,
    variables: { input: rechargeInput },
  });

  const recharge = rechargeResult?.data?.createAccountRechargeFromUSSD;
  if (!recharge) return end('❌ Something went wrong while recharging your account.');

  const rechargeId = recharge.id; // assign first, then use below

  console.log('[doRecharge] Before UPDATE mutation:', {
    latestPaymentId: latestPayment?.id,
    latestPaymentStructure: {
      id: latestPayment?.id,
      amount: latestPayment?.amount,
      status: latestPayment?.status,
    },
    rechargeId,
    phoneNumber,
  });

  let updateResult;
  try {
    updateResult = await executeQuery.mutate({
      mutation: UPDATE_PAYMENT_TRANSACTION_FOR_ACCOUNT_RECHARGE,
      variables: {
        id: latestPayment.id,
        input: { status: 'COMPLETED', qrCode: rechargeId },
        phone: phoneNumber,
      },
    });
    console.log('[doRecharge] UPDATE mutation succeeded:', updateResult?.data);
  } catch (mutationErr: any) {
    console.error('[doRecharge] UPDATE mutation failed:', {
      error: mutationErr?.message,
      graphQLErrors: mutationErr?.graphQLErrors,
      networkErrorResult: mutationErr?.networkError?.result,
    });
    throw mutationErr;
  }

  const label = business ? `Business` : `Client`;
  return new Response(`END ✅ ${label} Account Recharged!
Amount: RWF ${amount.toLocaleString()} ~ $${(amount / 1500).toFixed(2)}
Method: ${methodName.replace(/_/g, ' ')}
Reference: ${rechargeId}
Your account has been updated.`, {
    headers: { 'Content-Type': 'text/plain' },
  });
}

// ─── Shared token conversion executor ────────────────────────────────────────

async function doTokenConversion({
  phoneNumber,
  amount,
  userCountry,
}: {
  phoneNumber: string;
  amount: number;
  userCountry: string;
}) {
  const clientResult = await executeQuery.query({
    query: GET_CLIENT_BY_PHONE,
    variables: { phone: phoneNumber },
    fetchPolicy: 'network-only',
  });
  const client = clientResult.data?.clientByPhone;
  if (!client) return end('❌ No account found.');

  const rechargeResult = await executeQuery.mutate({
    mutation: CREATE_ACCOUNT_RECHARGE_FROM_USSD,
    variables: {
      input: { amount, method: 'TOKEN', origin: userCountry, clientId: client.id },
    },
  });

  const recharge = rechargeResult?.data?.createAccountRechargeFromUSSD;
  if (!recharge) return end('❌ Something went wrong while converting tokens.');

  const tokens = amount / 10;
  return new Response(`END ✅ Token Conversion Successful!
Converted $${amount.toFixed(2)} to ${tokens} uTn
Reference: ${recharge.id}
Your USCOR tokens have been added to your account.`, {
    headers: { 'Content-Type': 'text/plain' },
  });
}