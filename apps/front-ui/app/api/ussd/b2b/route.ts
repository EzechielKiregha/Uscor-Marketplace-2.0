import africastalking from 'africastalking';
import { NextRequest } from 'next/server';
import { GET_B2B_ORDERS, PAY_B2B_ORDER } from '@/graphql/b2b.gql';
import { GET_BUSINESS_BY_PHONE } from '@/graphql/business.gql';
import { GET_ACCOUNT_BALANCE } from '@/graphql/wallet.gql';
import { client as executeQuery } from '@/lib/apollo-client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function end(msg: string) {
  return new Response(`END ${msg}`, { headers: { 'Content-Type': 'text/plain' } });
}
function con(msg: string) {
  return new Response(`CON ${msg}`, { headers: { 'Content-Type': 'text/plain' } });
}

async function resolveBusiness(phone: string) {
  const result = await executeQuery.query({
    query: GET_BUSINESS_BY_PHONE,
    variables: { phone },
    fetchPolicy: 'network-only',
  });
  return result.data?.businessByPhone ?? null;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const phoneNumber = body.get('phoneNumber') as string;
  const text = (body.get('text') as string) || '';
  const parts = text.split('*');
  const depth = text === '' ? 0 : parts.length;

  try {
    // ── Step 0: Main menu ────────────────────────────────────
    if (text === '') {
      return con(`Welcome to USCOR B2B Payments
1. Pay B2B Order
2. View B2B Orders
3. Check Balance`);
    }

    // ════════════════════════════════════════════════════════════
    // FLOW 1 — Pay B2B Order
    // ════════════════════════════════════════════════════════════

    // 1 → Identify business, show payable orders
    else if (text === '1') {
      const business = await resolveBusiness(phoneNumber);
      if (!business) {
        return end('No business account found for this phone number.');
      }

      // Fetch approved/processing B2B orders where this business is buyer
      const ordersResult = await executeQuery.query({
        query: GET_B2B_ORDERS,
        variables: { role: 'buyer', status: 'APPROVED', page: 1, limit: 5 },
        fetchPolicy: 'network-only',
      });
      const orders = ordersResult.data?.b2bOrders?.items || [];

      if (orders.length === 0) {
        return end('No payable B2B orders found. Orders must be approved by the seller first.');
      }

      const lines = orders.map(
        (o: any, i: number) =>
          `${i + 1}. #${o.orderNumber?.substring(0, 8)} - ${o.seller?.name} $${o.total?.toFixed(2)}`,
      );

      return con(`B2B Orders to Pay (${business.name}):
${lines.join('\n')}

Select order number:`);
    }

    // 1*<selection> → Show order detail + confirm
    else if (parts[0] === '1' && depth === 2) {
      const selection = parseInt(parts[1]);

      const business = await resolveBusiness(phoneNumber);
      if (!business) return end('No business account found.');

      const ordersResult = await executeQuery.query({
        query: GET_B2B_ORDERS,
        variables: { role: 'buyer', status: 'APPROVED', page: 1, limit: 5 },
        fetchPolicy: 'network-only',
      });
      const orders = ordersResult.data?.b2bOrders?.items || [];
      const order = orders[selection - 1];

      if (!order) return end('Invalid selection.');

      return con(`B2B Payment Confirmation
Seller: ${order.seller?.name}
Order #${order.orderNumber?.substring(0, 8)}
Items: ${order.items?.length}
Amount: $${order.total?.toFixed(2)}
Terms: ${order.paymentTerms?.replace('_', ' ')}

Select payment method:
1. MTN Money
2. Airtel Money
3. Orange Money
4. M-Pesa`);
    }

    // 1*<selection>*<method> → Confirm payment
    else if (parts[0] === '1' && depth === 3) {
      const selection = parseInt(parts[1]);
      const methodChoice = parts[2];

      const methodNames = ['MTN_MONEY', 'AIRTEL_MONEY', 'ORANGE_MONEY', 'MPESA'];
      const methodLabels = ['MTN Money', 'Airtel Money', 'Orange Money', 'M-Pesa'];
      const method = methodNames[parseInt(methodChoice) - 1];

      if (!method) return end('Invalid payment method.');

      const business = await resolveBusiness(phoneNumber);
      if (!business) return end('No business account found.');

      const ordersResult = await executeQuery.query({
        query: GET_B2B_ORDERS,
        variables: { role: 'buyer', status: 'APPROVED', page: 1, limit: 5 },
        fetchPolicy: 'network-only',
      });
      const orders = ordersResult.data?.b2bOrders?.items || [];
      const order = orders[selection - 1];

      if (!order) return end('Order not found.');

      return con(`Confirm B2B Payment
To: ${order.seller?.name}
Amount: $${order.total?.toFixed(2)}
Via: ${methodLabels[parseInt(methodChoice) - 1]}

1. Confirm Payment
2. Cancel`);
    }

    // 1*<selection>*<method>*1 → Execute payment
    else if (parts[0] === '1' && depth === 4 && parts[3] === '1') {
      const selection = parseInt(parts[1]);

      const methodNames = ['MOBILE_MONEY', 'MOBILE_MONEY', 'MOBILE_MONEY', 'MOBILE_MONEY'];
      const method = methodNames[parseInt(parts[2]) - 1] || 'MOBILE_MONEY';

      const business = await resolveBusiness(phoneNumber);
      if (!business) return end('No business account found.');

      const ordersResult = await executeQuery.query({
        query: GET_B2B_ORDERS,
        variables: { role: 'buyer', status: 'APPROVED', page: 1, limit: 5 },
        fetchPolicy: 'network-only',
      });
      const orders = ordersResult.data?.b2bOrders?.items || [];
      const order = orders[selection - 1];

      if (!order) return end('Order not found.');

      // Execute payment
      await executeQuery.mutate({
        mutation: PAY_B2B_ORDER,
        variables: { orderId: order.id, method },
      });

      // Generate transaction reference
      const transactionId = `B2B-${Date.now()}`;

      // Send SMS confirmation
      try {
        const Aclient = africastalking({
          apiKey: 'atsk_377491ab471067675b1a21b1000906b095aaf954e225d43f24806d37d1190d7363180ebf',
          username: 'sandbox',
        });

        await Aclient.SMS.send({
          to: [phoneNumber],
          message: `USCOR B2B Payment Confirmed
Order #${order.orderNumber?.substring(0, 8)}
Seller: ${order.seller?.name}
Amount: $${order.total?.toFixed(2)}
Reference: ${transactionId}`,
          from: 'USCOR_FINANCE',
        });
      } catch (smsErr) {
        console.error('SMS send failed:', smsErr);
      }

      return end(`B2B Payment Confirmed!
Order #${order.orderNumber?.substring(0, 8)}
Seller: ${order.seller?.name}
Amount: $${order.total?.toFixed(2)}
Reference: ${transactionId}
Thank you for using USCOR B2B!`);
    }

    // 1*<selection>*<method>*2 → Cancel
    else if (parts[0] === '1' && depth === 4 && parts[3] === '2') {
      return end('B2B payment cancelled.');
    }

    // ════════════════════════════════════════════════════════════
    // FLOW 2 — View B2B Orders
    // ════════════════════════════════════════════════════════════

    else if (text === '2') {
      const business = await resolveBusiness(phoneNumber);
      if (!business) return end('No business account found.');

      return con(`View B2B Orders (${business.name})
1. Orders Sent (Buyer)
2. Orders Received (Seller)
3. All Orders`);
    }

    // 2*<role> → List orders
    else if (parts[0] === '2' && depth === 2) {
      const roleMap: Record<string, string> = { '1': 'buyer', '2': 'seller', '3': 'all' };
      const role = roleMap[parts[1]];

      if (!role) return end('Invalid option.');

      const ordersResult = await executeQuery.query({
        query: GET_B2B_ORDERS,
        variables: { role, page: 1, limit: 5 },
        fetchPolicy: 'network-only',
      });
      const orders = ordersResult.data?.b2bOrders?.items || [];
      const total = ordersResult.data?.b2bOrders?.total || 0;

      if (orders.length === 0) {
        return end('No B2B orders found.');
      }

      const lines = orders.map((o: any) => {
        const counterparty = role === 'seller' ? o.buyer?.name : o.seller?.name;
        return `#${o.orderNumber?.substring(0, 8)} ${counterparty} $${o.total?.toFixed(2)} [${o.status}]`;
      });

      return end(`B2B Orders (${total} total):
${lines.join('\n')}`);
    }

    // ════════════════════════════════════════════════════════════
    // FLOW 3 — Check Balance
    // ════════════════════════════════════════════════════════════

    else if (text === '3') {
      const business = await resolveBusiness(phoneNumber);
      if (!business) return end('No business account found.');

      const balanceResult = await executeQuery.query({
        query: GET_ACCOUNT_BALANCE,
        variables: { userId: business.id, userType: 'BUSINESS' },
      });
      const bal = balanceResult?.data?.accountBalance;

      return end(`Business Account Balance (${business.name})
Total: $${bal?.totalAmount?.toFixed(2) || '0.00'}
Available: $${bal?.availableAmount?.toFixed(2) || '0.00'}
Pending: $${bal?.pendingAmount?.toFixed(2) || '0.00'}
USCOR Tokens: ${bal?.tokenBalance?.totalTokens || 0} uTn`);
    }

    else {
      return end('Invalid option. Please try again.');
    }
  } catch (error: any) {
    console.error('USSD B2B Error:', {
      message: error?.message,
      graphQLErrors: error?.graphQLErrors,
    });
    return end('An error occurred. Please try again later.');
  }
}
