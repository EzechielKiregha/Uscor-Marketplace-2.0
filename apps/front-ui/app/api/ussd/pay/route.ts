import { NextRequest } from 'next/server';
import { client as executeQuery } from "@/lib/apollo-client";
import { fetchMe } from '@/lib/fetchMe';
import { BusinessEntity, ClientEntity } from '@/lib/types';
import { GET_PAYMENT_LATEST_TRANSACTION, UPDATE_PAYMENT_TRANSACTION } from '@/graphql/payment.gql';
import { GET_ACCOUNT_BALANCE } from '@/graphql/wallet.gql';
import africastalking from "africastalking";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const phoneNumber = body.get('phoneNumber') as string;
  const text = (body.get('text') as string) || '';
  
  try {
    const userResult = await fetchMe();
    
    let response = '';
    let transactionId = '';

    // Step 0: Initial USSD menu
    if (text === '') {
      response = `CON Welcome to USCOR Payment System
1. Pay for Order
2. Check Balance
3. Convert Tokens`;
    }
    // Step 1: Pay for Order
    else if (text === '1') {
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role;
      
      if (!client || (!role || role !== 'client')) {
        const business = userResult?.user as BusinessEntity;
        
        if (!business || role !== 'business') {
          response = `END ❌ No account found. Please register first.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        }
        
        // Business user
        const paymentResult = await executeQuery.query({
          query: GET_PAYMENT_LATEST_TRANSACTION,
          fetchPolicy: 'network-only'
        });
        const latestPayment = paymentResult?.data?.latestPaymentTransaction;
        
        if (!latestPayment || latestPayment?.status !== 'PENDING') {
          response = `END ❌ No pending payment found for your business.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        }
        
        response = `CON 🏪 Business Payment for ${business.name}
Order ID: ${latestPayment?.order?.id?.substring(0, 8)}
Amount: $${latestPayment?.amount?.toFixed(2)}
1. Confirm Payment
2. Cancel`;
      } else {
        // Client user
        // Get latest pending payment transaction
        const paymentResult = await executeQuery.query({
          query: GET_PAYMENT_LATEST_TRANSACTION,
          fetchPolicy: 'network-only'
        });
        const latestPayment = paymentResult?.data?.latestPaymentTransaction;
        
        if (!latestPayment || latestPayment.status !== 'PENDING') {
          response = `END ❌ No pending payment found for your account.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        }
        
        response = `CON 🛒 Order Payment for ${client.fullName}
Order ID: ${latestPayment?.order?.id?.substring(0, 8)}
Amount: $${latestPayment?.amount?.toFixed(2)}
1. Confirm Payment
2. Cancel`;
      }
    }
    // Step 2: Confirm Payment
    else if (text === '1*1') {
      // Get latest pending payment transaction
      const paymentResult = await executeQuery.query({
        query: GET_PAYMENT_LATEST_TRANSACTION,
        fetchPolicy: 'network-only'
      });
      const latestPayment = paymentResult?.data?.latestPaymentTransaction;
      
      if (!latestPayment || latestPayment?.status !== 'PENDING') {
        response = `END ❌ No pending payment found.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Generate unique transaction ID
      transactionId = `TX-${Date.now()}`;
      const Aclient = africastalking({
        apiKey: 'atsk_377491ab471067675b1a21b1000906b095aaf954e225d43f24806d37d1190d7363180ebf',
        username: "sandbox",
      });

      const sms = Aclient.SMS;

      const res = await sms.send({
        to: ['+250790802201'],
        message: `USCOR Payment Confirmation
User: ${userResult?.user?.fullName || 'Unknown'}
Order ID: ${latestPayment?.order?.id?.substring(0, 8)}
Amount: $${latestPayment?.amount?.toFixed(2)}
Reference: ${transactionId}`,
        from: "USCOR_FINANCE",
      })
      
      // Update payment transaction status to completed
      await executeQuery.mutate({
        mutation: UPDATE_PAYMENT_TRANSACTION,
        variables: {
          id: latestPayment.id,
          input: {
            status: 'COMPLETED',
            qrCode: transactionId
          }
        }
      });
      
      response = `END ✅ Payment Confirmed!
Order ID: ${latestPayment?.order?.id?.substring(0, 8)}
Amount: $${latestPayment?.amount?.toFixed(2)}
Reference: ${transactionId}
Thank you for using USCOR!`;
    }
    // Step 2: Cancel Payment
    else if (text === '1*2') {
      response = `END ❌ Payment cancelled. Contact support if you need assistance.`;
    }
    // Step 3: Check Balance
    else if (text === '2') {
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role;
      
      if (!client || (!role || role !== 'client')) {
        const business = userResult?.user as BusinessEntity;
        
        if (!business || role !== 'business') {
          response = `END ❌ No account found.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        }
        
        // Business balance
        const balanceResult = await executeQuery.query({
          query: GET_ACCOUNT_BALANCE,
          variables: {
            userId: business.id,
            userType: 'BUSINESS'
          }
        });
        
        const balance = balanceResult?.data?.accountBalance;
        
        response = `END 💰 Business Account Balance
Total: $${balance?.totalAmount?.toFixed(2) || '0.00'}
Available: $${balance?.availableAmount?.toFixed(2) || '0.00'}
Pending: $${balance?.pendingAmount?.toFixed(2) || '0.00'}
USCOR Tokens: ${(balance?.tokenBalance?.totalTokens || 0)} uTn`;
      } else {
        // Client balance
        const balanceResult = await executeQuery.query({
          query: GET_ACCOUNT_BALANCE,
          variables: {
            userId: client.id,
            userType: 'CLIENT'
          }
        });
        
        const balance = balanceResult?.data?.accountBalance;
        
        response = `END 💰 Your Account Balance
Total: $${balance?.totalAmount?.toFixed(2) || '0.00'}
Available: $${balance?.availableAmount?.toFixed(2) || '0.00'}
Pending: $${balance?.pendingAmount?.toFixed(2) || '0.00'}
USCOR Tokens: ${(balance?.tokenBalance?.totalTokens || 0)} uTn`;
      }
    }
    // Step 4: Convert Tokens
    else if (text === '3') {
      response = `CON 🔄 Token Conversion
1. Convert to Cash
2. Convert to Mobile Money
3. Back to Main Menu`;
    }
    // Step 5: Convert Tokens to Cash
    else if (text === '3*1') {
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role;
      
      if (!client || role !== 'client') {
        response = `END ❌ Only clients can convert tokens to cash.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Get account balance
      const balanceResult = await executeQuery.query({
        query: GET_ACCOUNT_BALANCE,
        variables: {
          userId: client.id,
          userType: 'CLIENT'
        }
      });
      
      const balance = balanceResult?.data?.accountBalance;
      const tokens = balance?.tokenBalance?.availableTokens || 0;
      
      response = `CON 🪙 Convert Tokens to Cash
Available Tokens: ${tokens} uTn
1. Convert 10 uTn to $100
2. Convert 50 uTn to $500
3. Convert 100 uTn to $1000
4. Back to Previous Menu`;
    }
    // Step 6: Confirm Token Conversion
    else if (text.startsWith('3*1*')) {
      const option = text.split('*')[2];
      let tokenAmount = 0;
      
      switch (option) {
        case '1': tokenAmount = 10; break;
        case '2': tokenAmount = 50; break;
        case '3': tokenAmount = 100; break;
        case '4': 
          response = `CON Welcome to USCOR Payment System
1. Pay for Order
2. Check Balance
3. Convert Tokens`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        default:
          response = `END ❌ Invalid option. Please try again.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role;
      
      if (!client || role !== 'client') {
        response = `END ❌ No account found.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Get account balance
      const balanceResult = await executeQuery.query({
        query: GET_ACCOUNT_BALANCE,
        variables: {
          userId: client.id,
          userType: 'CLIENT'
        }
      });
      
      const balance = balanceResult?.data?.accountBalance;
      const availableTokens = balance?.tokenBalance?.availableTokens || 0;
      
      if (availableTokens < tokenAmount) {
        response = `END ❌ Insufficient tokens. You have ${availableTokens} uTn available.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Generate transaction ID
      transactionId = `TK-${Date.now()}`;

      const Aclient = africastalking({
        apiKey: 'atsk_377491ab471067675b1a21b1000906b095aaf954e225d43f24806d37d1190d7363180ebf',
        username: "sandbox",
      });

      const sms = Aclient.SMS;

      const res = await sms.send({
        to: ['+250790802201'],
        message: `USCOR Token Conversion
          Client: ${client.fullName}
          Tokens Converted: ${tokenAmount} uTn
          Amount: $${tokenAmount * 10}
          Reference: ${transactionId}`,
        from: "USCOR_FINANCE",
      })
      
      // Process token conversion
      // In a real app, this would call a mutation to convert tokens to cash
      response = `END ✅ Token Conversion Confirmed!
Converted ${tokenAmount} uTn to $${tokenAmount * 10}
Reference: ${transactionId}
Amount will be sent to your phone within 24 hours.`;
    }
    // Step 5: Convert Tokens to Mobile Money
    else if (text === '3*2') {
      response = `CON 📱 Convert Tokens to Mobile Money
Select Provider:
1. MTN Money
2. Airtel Money
3. Orange Money
4. M-Pesa`;
    }
    // Step 6: Select Mobile Money Provider
    else if (text.startsWith('3*2*') && text.split('*').length === 3) {
      const provider = text.split('*')[2];
      const providerNames = ['MTN_MONEY', 'AIRTEL_MONEY', 'ORANGE_MONEY', 'MPESA'];
      const providerName = providerNames[parseInt(provider) - 1];
      
      if (!providerName) {
        response = `END ❌ Invalid provider selection.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role;
      
      if (!client || role !== 'client') {
        response = `END ❌ No account found.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Get account balance
      const balanceResult = await executeQuery.query({
        query: GET_ACCOUNT_BALANCE,
        variables: {
          userId: client.id,
          userType: 'CLIENT'
        }
      });
      
      const balance = balanceResult?.data?.accountBalance;
      const tokens = balance?.tokenBalance?.availableTokens || 0;
      
      response = `CON 🪙 Convert Tokens to ${providerName}
Available Tokens: ${tokens} uTn
Enter amount to convert:
1. 10 uTn ($100)
2. 50 uTn ($500)
3. 100 uTn ($1000)
4. Custom amount`;
    }
    // Step 7: Custom amount for token conversion
    else if (text.startsWith('3*2*') && text.split('*').length === 4) {
      const amount = text.split('*')[3];
      
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role;
      
      if (!client || role !== 'client') {
        response = `END ❌ No account found.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Get account balance
      const balanceResult = await executeQuery.query({
        query: GET_ACCOUNT_BALANCE,
        variables: {
          userId: client.id,
          userType: 'CLIENT'
        }
      });
      
      const balance = balanceResult?.data?.accountBalance;
      const availableTokens = balance?.tokenBalance?.availableTokens || 0;
      
      const tokenAmount = parseInt(amount);
      if (isNaN(tokenAmount) || tokenAmount <= 0) {
        response = `END ❌ Invalid amount entered.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      if (availableTokens < tokenAmount) {
        response = `END ❌ Insufficient tokens. You have ${availableTokens} uTn available.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Generate transaction ID
      transactionId = `TK-${Date.now()}`;
      
      // Process token conversion
      response = `END ✅ Token Conversion Confirmed!
Converted ${tokenAmount} uTn to $${tokenAmount * 10} to your mobile money
Reference: ${transactionId}
Amount will be sent to your phone within 24 hours.`;
    }
    // Step 5: Back to Main Menu
    else if (text === '3*4') {
      response = `CON Welcome to USCOR Payment System
1. Pay for Order
2. Check Balance
3. Convert Tokens`;
    }
    else {
      response = `END ❌ Invalid option. Please try again.`;
    }

    return new Response(response, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('USSD Pay Error:', error);
    return new Response(`END ❌ An error occurred. Please try again later.`, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}