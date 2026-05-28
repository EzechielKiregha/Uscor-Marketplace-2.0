import { NextRequest } from 'next/server';
import { client as executeQuery } from "@/lib/apollo-client";
import { fetchMe } from '@/lib/fetchMe';
import { BusinessEntity, ClientEntity } from '@/lib/types';
import { CREATE_ACCOUNT_RECHARGE, GET_ACCOUNT_BALANCE } from '@/graphql/wallet.gql';

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const phoneNumber = body.get('phoneNumber') as string;
  const text = (body.get('text') as string) || '';

  
  let response = '';
  let rechargeId = '';
  
  try {
    const userResult = await fetchMe();
    
    // Determine country based on phone number prefix
    const getCountryFromPhone = (phone: string): string => {
      if (phone.startsWith('+250') || phone.startsWith('250')) return 'RWANDA';
      if (phone.startsWith('+256') || phone.startsWith('256')) return 'UGANDA';
      if (phone.startsWith('+254') || phone.startsWith('254')) return 'KENYA';
      if (phone.startsWith('+255') || phone.startsWith('255')) return 'TANZANIA';
      if (phone.startsWith('+243') || phone.startsWith('243')) return 'DRC';
      if (phone.startsWith('+257') || phone.startsWith('257')) return 'BURUNDI';
      return 'RWANDA'; // Default to Rwanda
    };

    const userCountry = getCountryFromPhone(phoneNumber);

    // Step 0: Initial Recharge Menu
    if (text === '') {
      response = `CON Welcome to USCOR Recharge Service
You are using a ${userCountry === 'DRC' ? 'Congolese' : 
              userCountry === 'RWANDA' ? 'Rwandan' : 
              userCountry === 'UGANDA' ? 'Ugandan' : 
              userCountry === 'KENYA' ? 'Kenyan' : 
              userCountry === 'TANZANIA' ? 'Tanzanian' : 
              'East African'} phone
1. Recharge Account
2. Convert to Tokens
3. Check Balance`;
    }
    // Step 1: Recharge Account
    else if (text === '1') {
      
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role
      
      if (!client || (!role || role !== 'client')) {
        
        const business = userResult?.user as BusinessEntity;
        
        if (business && (!role || role !== 'business')) {
          response = `END ❌ No account found with this phone number. Please register first.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        }
        
        // Business user
        response = `CON 🏪 Recharge Business Account
Select Payment Method:
1. MTN Money
2. Airtel Money
3. Orange Money
4. M-Pesa`;
      } else {
        // Client user
        response = `CON 💳 Recharge Client Account
Select Payment Method:
1. MTN Money
2. Airtel Money
3. Orange Money
4. M-Pesa`;
      }
    }
    // Step 2: Select Payment Method
    else if (text.startsWith('1*')) {
      const method = text.split('*')[1];
      const methodNames = ['MTN_MONEY', 'AIRTEL_MONEY', 'ORANGE_MONEY', 'MPESA'];
      const methodName = methodNames[parseInt(method) - 1];
      
      if (!methodName) {
        response = `END ❌ Invalid payment method.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role
      
      if (!client || (!role || role !== 'client')) {
        
        const business = userResult?.user as BusinessEntity;
        
        if (business && (!role || role !== 'business')) {
          response = `END ❌ No account found.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        }
        
        // Business user
        response = `CON 🏪 Recharge Business Account with ${methodName}
Enter amount to recharge:
1. $10
2. $25
3. $50
4. $100
5. $200
6. Custom amount`;
      } else {
        // Client user
        response = `CON 💳 Recharge Client Account with ${methodName}
Enter amount to recharge:
1. $10
2. $25
3. $50
4. $100
5. $200
6. Custom amount`;
      }
    }
    // Step 3: Enter Amount
    else if (text.startsWith('1*') && text.split('*').length === 3) {
      const method = text.split('*')[1];
      const amountOption = text.split('*')[2];
      const methodNames = ['MTN_MONEY', 'AIRTEL_MONEY', 'ORANGE_MONEY', 'MPESA'];
      const methodName = methodNames[parseInt(method) - 1];
      
      let amount = 0;
      switch (amountOption) {
        case '1': amount = 10; break;
        case '2': amount = 25; break;
        case '3': amount = 50; break;
        case '4': amount = 100; break;
        case '5': amount = 200; break;
        case '6': 
          response = `CON 📝 Enter custom amount to recharge (in $):
Back: 0`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        default:
          response = `END ❌ Invalid amount option.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role
      
      if (!client || (!role || role !== 'client')) {
        
        const business = userResult?.user as BusinessEntity;
        
        if (business && (!role || role !== 'business')) {
          response = `END ❌ No account found.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        }
        
        // Confirm recharge for business
        response = `CON 🏪 Confirm Recharge
Business: ${(business as BusinessEntity).name}
Amount: $${amount}
Method: ${methodName}
Origin: ${userCountry}
1. Confirm
2. Cancel`;
      } else {
        // Confirm recharge for client
        response = `CON 💳 Confirm Recharge
Client: ${client.fullName}
Amount: $${amount}
Method: ${methodName}
Origin: ${userCountry}
1. Confirm
2. Cancel`;
      }
    }
    // Step 4: Confirm Recharge
    else if (text.startsWith('1*') && text.split('*').length === 4) {
      const method = text.split('*')[1];
      const amountOption = text.split('*')[2];
      const confirmation = text.split('*')[3];
      
      if (confirmation !== '1') {
        response = `END ❌ Recharge cancelled.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      let amount = 0;
      switch (amountOption) {
        case '1': amount = 10; break;
        case '2': amount = 25; break;
        case '3': amount = 50; break;
        case '4': amount = 100; break;
        case '5': amount = 200; break;
        default:
          response = `END ❌ Invalid amount option.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      const methodNames = ['MTN_MONEY', 'AIRTEL_MONEY', 'ORANGE_MONEY', 'MPESA'];
      const methodName = methodNames[parseInt(method) - 1];
      
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role
      
      if (!client || (!role || role !== 'client')) {
        
        const business = userResult?.user as BusinessEntity;
        
        if (business && (!role || role !== 'business')) {
          response = `END ❌ No account found.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        }
        
        // Create account recharge for business
        const rechargeResult = await executeQuery.mutate(
          {
            mutation: CREATE_ACCOUNT_RECHARGE,
            variables: {
              input: {
                amount,
                method: methodName,
                origin: userCountry,
                businessId: business.id
              }
            }
          }
        );
        
        const recharge = rechargeResult?.data?.createAccountRecharge;
        rechargeId = recharge?.id;
        
        response = `END ✅ Business Account Recharged!
Amount: $${amount}
Method: ${methodName}
Reference: ${rechargeId}
Your account has been updated.`;
      } else {
        // Create account recharge for client
        const rechargeResult = await executeQuery.mutate(
          {
            mutation: CREATE_ACCOUNT_RECHARGE,
            variables: {
              input: {
                amount,
                method: methodName,
                origin: userCountry,
                clientId: client.id
              }
          }
        });
        
        const recharge = rechargeResult?.data?.createAccountRecharge;
        rechargeId = recharge?.id;
        
        response = `END ✅ Client Account Recharged!
Amount: $${amount}
Method: ${methodName}
Reference: ${rechargeId}
Your account has been updated.`;
      }
    }
    // Step 3: Custom Amount
    else if (text.startsWith('1*') && text.split('*').length === 4 && text.endsWith('*6')) {
      const customAmount = text.split('*')[3];
      
      if (customAmount === '0') {
        // Go back to previous menu
        response = `CON Recharge Account
Select Payment Method:
1. MTN Money
2. Airtel Money
3. Orange Money
4. M-Pesa`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      const amount = parseFloat(customAmount);
      if (isNaN(amount) || amount <= 0) {
        response = `END ❌ Invalid amount. Please enter a positive number.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role
      
      if (!client || (!role || role !== 'client')) {
        
        const business = userResult?.user as BusinessEntity;
        
        if (business && (!role || role !== 'business')) {
          response = `END ❌ No account found.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        }
        
        // Confirm custom recharge for business
        response = `CON 🏪 Confirm Recharge
Business: ${(business as BusinessEntity).name}
Amount: $${amount}
Method: MTN Money
Origin: ${userCountry}
1. Confirm
2. Cancel`;
      } else {
        // Confirm custom recharge for client
        response = `CON 💳 Confirm Recharge
Client: ${client.fullName}
Amount: $${amount}
Method: MTN Money
Origin: ${userCountry}
1. Confirm
2. Cancel`;
      }
    }
    // Step 4: Confirm Custom Recharge
    else if (text.startsWith('1*') && text.split('*').length === 5) {
      const method = text.split('*')[1];
      const customAmount = text.split('*')[3];
      const confirmation = text.split('*')[4];
      
      if (confirmation !== '1') {
        response = `END ❌ Recharge cancelled.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      const amount = parseFloat(customAmount);
      if (isNaN(amount) || amount <= 0) {
        response = `END ❌ Invalid amount.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      const methodNames = ['MTN_MONEY', 'AIRTEL_MONEY', 'ORANGE_MONEY', 'MPESA'];
      const methodName = methodNames[parseInt(method) - 1];
      
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role
      
      if (!client || (!role || role !== 'client')) {
        
        const business = userResult?.user as BusinessEntity;
        
        if (business && (!role || role !== 'business')) {
          response = `END ❌ No account found.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        }
        
        // Create account recharge for business
        const rechargeResult = await executeQuery.mutate({
          mutation: CREATE_ACCOUNT_RECHARGE,
          variables: {
            input: {
              amount,
              method: methodName,
              origin: userCountry,
              businessId: business.id
          }
        }
        });
        
        const recharge = rechargeResult?.data?.createAccountRecharge;
        rechargeId = recharge?.id;
        
        response = `END ✅ Business Account Recharged!
Amount: $${amount}
Method: ${methodName}
Reference: ${rechargeId}
Your account has been updated.`;
      } else {
        // Create account recharge for client
        const rechargeResult = await executeQuery.mutate({
          mutation: CREATE_ACCOUNT_RECHARGE,
          variables: {
            input: {
              amount,
              method: methodName,
              origin: userCountry,
              clientId: client.id
            }
          }
        });
        
        const recharge = rechargeResult?.data?.createAccountRecharge;
        rechargeId = recharge?.id;
        
        response = `END ✅ Client Account Recharged!
Amount: $${amount}
Method: ${methodName}
Reference: ${rechargeId}
Your account has been updated.`;
      }
    }
    // Step 1: Convert to Tokens
    else if (text === '2') {
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role
      
      if (!client || (!role || role !== 'client')) {
        response = `END ❌ Only clients can convert recharge to tokens.`;
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
      const availableBalance = balance?.availableAmount || 0;
      
      response = `CON 🪙 Convert Recharge to Tokens
Available Balance: $${availableBalance.toFixed(2)}
1. Convert $10 to 1 uTn
2. Convert $50 to 5 uTn
3. Convert $100 to 10 uTn
4. Convert $500 to 50 uTn
5. Convert $1000 to 100 uTn
6. Custom amount`;
    }
    // Step 2: Select Token Conversion Amount
    else if (text.startsWith('2*')) {
      const option = text.split('*')[1];
      let amount = 0;
      
      switch (option) {
        case '1': amount = 10; break;
        case '2': amount = 50; break;
        case '3': amount = 100; break;
        case '4': amount = 500; break;
        case '5': amount = 1000; break;
        case '6': 
          response = `CON 📝 Enter custom amount to convert to tokens (in $):
Back: 0`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        default:
          response = `END ❌ Invalid option.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Get user by phone number
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role
      
      if (!client || (!role || role !== 'client')) {
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
      const availableBalance = balance?.availableAmount || 0;
      
      if (availableBalance < amount) {
        response = `END ❌ Insufficient balance. You have $${availableBalance.toFixed(2)} available.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Confirm token conversion
      const tokens = amount / 10; // 1 uTn = $10
      response = `CON 🪙 Confirm Token Conversion
Convert $${amount} to ${tokens} uTn
1. Confirm
2. Cancel`;
    }
    // Step 3: Confirm Token Conversion
    else if (text.startsWith('2*') && text.split('*').length === 3) {
      const option = text.split('*')[1];
      const confirmation = text.split('*')[2];
      
      if (confirmation !== '1') {
        response = `END ❌ Token conversion cancelled.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      let amount = 0;
      switch (option) {
        case '1': amount = 10; break;
        case '2': amount = 50; break;
        case '3': amount = 100; break;
        case '4': amount = 500; break;
        case '5': amount = 1000; break;
        default:
          response = `END ❌ Invalid option.`;
          return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Get user by phone number
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role
      
      if (!client || (!role || role !== 'client')) {
        response = `END ❌ No account found.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Create account recharge with TOKEN method
      const rechargeResult = await executeQuery.query({
        query: CREATE_ACCOUNT_RECHARGE,
        variables: {
          input: {
            amount,
            method: 'TOKEN',
            origin: userCountry,
            clientId: client.id
          }
        }
      });
      
      const recharge = rechargeResult?.data?.createAccountRecharge;
      rechargeId = recharge?.id;
      
      const tokens = amount / 10; // 1 uTn = $10
      response = `END ✅ Token Conversion Successful!
Converted $${amount} to ${tokens} uTn
Reference: ${rechargeId}
Your USCOR tokens have been added to your account.`;
    }
    // Step 2: Custom Token Conversion
    else if (text.startsWith('2*') && text.split('*').length === 3 && text.endsWith('*6')) {
      const customAmount = text.split('*')[2];
      
      if (customAmount === '0') {
        // Go back to previous menu
        response = `CON Convert Recharge to Tokens
1. Convert $10 to 1 uTn
2. Convert $50 to 5 uTn
3. Convert $100 to 10 uTn
4. Convert $500 to 50 uTn
5. Convert $1000 to 100 uTn
6. Custom amount`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      const amount = parseFloat(customAmount);
      if (isNaN(amount) || amount <= 0) {
        response = `END ❌ Invalid amount. Please enter a positive number.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Get user by phone number
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role
      
      if (!client || (!role || role !== 'client')) {
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
      const availableBalance = balance?.availableAmount || 0;
      
      if (availableBalance < amount) {
        response = `END ❌ Insufficient balance. You have $${availableBalance.toFixed(2)} available.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Confirm custom token conversion
      const tokens = amount / 10; // 1 uTn = $10
      response = `CON 🪙 Confirm Token Conversion
Convert $${amount} to ${tokens} uTn
1. Confirm
2. Cancel`;
    }
    // Step 3: Confirm Custom Token Conversion
    else if (text.startsWith('2*') && text.split('*').length === 4) {
      const customAmount = text.split('*')[2];
      const confirmation = text.split('*')[3];
      
      if (confirmation !== '1') {
        response = `END ❌ Token conversion cancelled.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      const amount = parseFloat(customAmount);
      if (isNaN(amount) || amount <= 0) {
        response = `END ❌ Invalid amount.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Get user by phone number
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role
      
      if (!client || (!role || role !== 'client')) {
        response = `END ❌ No account found.`;
        return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
      }
      
      // Create account recharge with TOKEN method
      const rechargeResult = await executeQuery.query({
        query: CREATE_ACCOUNT_RECHARGE,
        variables: {
          input: {
            amount,
            method: 'TOKEN',
            origin: userCountry,
            clientId: client.id
          }
        }
      });
      
      const recharge = rechargeResult?.data?.createAccountRecharge;
      rechargeId = recharge?.id;
      
      const tokens = amount / 10; // 1 uTn = $10
      response = `END ✅ Token Conversion Successful!
Converted $${amount} to ${tokens} uTn
Reference: ${rechargeId}
Your USCOR tokens have been added to your account.`;
    }
    // Step 1: Check Balance
    else if (text === '3') {
      const client = userResult?.user as ClientEntity;
      const role = userResult?.role
      
      if (!client || (!role || role !== 'client')) {
        
        const business = userResult?.user as BusinessEntity;
        
        if (business && (!role || role !== 'business')) {
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
USCOR Tokens: ${(balance?.tokenBalance?.totalTokens || 0)} uTn
Last Updated: ${new Date().toLocaleDateString()}`;
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
        response = `END 💰 Client Account Balance
Total: $${balance?.totalAmount?.toFixed(2) || '0.00'}
Available: $${balance?.availableAmount?.toFixed(2) || '0.00'}
Pending: $${balance?.pendingAmount?.toFixed(2) || '0.00'}
USCOR Tokens: ${(balance?.tokenBalance?.totalTokens || 0)} uTn
Last Updated: ${new Date().toLocaleDateString()}`;
      }
    }
    else {
      response = `END ❌ Invalid option. Please try again.`;
    }

    return new Response(response, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('USSD Recharge Error:', error);
    return new Response(`END ❌ An error occurred. Please try again later.`, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}