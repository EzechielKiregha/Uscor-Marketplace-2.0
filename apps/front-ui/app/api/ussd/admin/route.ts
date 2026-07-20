import { NextRequest } from 'next/server';
import { GET_ADMIN_BY_PHONE } from '@/graphql/admin.gql';
import {
  BATCH_DISTRIBUTE_SETTLEMENTS,
  DISTRIBUTE_SETTLEMENT,
  GET_SETTLEMENTS,
  GET_SETTLEMENT_STATS,
} from '@/graphql/settlement.gql';
import { client as executeQuery } from '@/lib/apollo-client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function end(msg: string) {
  return new Response(`END ${msg}`, { headers: { 'Content-Type': 'text/plain' } });
}
function con(msg: string) {
  return new Response(`CON ${msg}`, { headers: { 'Content-Type': 'text/plain' } });
}

async function resolveAdmin(phone: string) {
  const result = await executeQuery.query({
    query: GET_ADMIN_BY_PHONE,
    variables: { phone },
    fetchPolicy: 'network-only',
  });
  return result.data?.adminByPhone ?? null;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const phoneNumber = body.get('phoneNumber') as string;
  const text = (body.get('text') as string) || '';
  const parts = text.split('*');
  const depth = text === '' ? 0 : parts.length;

  try {
    // Verify admin identity by phone
    const admin = await resolveAdmin(phoneNumber);
    if (!admin || !admin.isActive) {
      return end('Access denied. This service is for USCOR administrators only.');
    }

    // ── Step 0: Main menu ────────────────────────────────────
    if (text === '') {
      return con(`USCOR Admin Panel
Welcome, ${admin.fullName || 'Admin'}
1. Distribute Settlements
2. View Settlement Stats
3. Check Pending Settlements`);
    }

    // ════════════════════════════════════════════════════════════
    // FLOW 1 — Distribute Settlements
    // ════════════════════════════════════════════════════════════

    // 1 → Show pending summary + options
    else if (text === '1') {
      const statsResult = await executeQuery.query({
        query: GET_SETTLEMENT_STATS,
        variables: {},
        fetchPolicy: 'network-only',
      });
      const stats = statsResult.data?.settlementStats;

      if (!stats || stats.pendingCount === 0) {
        return end('No pending settlements to distribute.');
      }

      return con(`Pending Settlements: ${stats.pendingCount}
Total Amount: $${stats.totalPending?.toFixed(2) || '0.00'}
Platform Fees: $${stats.totalPlatformFees?.toFixed(2) || '0.00'}
1. Distribute All Pending
2. Back to Menu`);
    }

    // 1*1 → Confirm distribute all
    else if (text === '1*1') {
      const settlementsResult = await executeQuery.query({
        query: GET_SETTLEMENTS,
        variables: { status: 'PENDING', page: 1, limit: 100 },
        fetchPolicy: 'network-only',
      });
      const settlements = settlementsResult.data?.settlements?.items || [];

      if (settlements.length === 0) {
        return end('No pending settlements found.');
      }

      return con(`Confirm: Distribute ${settlements.length} settlements?
1. Yes, distribute all
2. Cancel`);
    }

    // 1*1*1 → Execute batch distribute
    else if (text === '1*1*1') {
      const settlementsResult = await executeQuery.query({
        query: GET_SETTLEMENTS,
        variables: { status: 'PENDING', page: 1, limit: 100 },
        fetchPolicy: 'network-only',
      });
      const settlements = settlementsResult.data?.settlements?.items || [];

      if (settlements.length === 0) {
        return end('No pending settlements to distribute.');
      }

      const ids = settlements.map((s: any) => s.id);
      await executeQuery.mutate({
        mutation: BATCH_DISTRIBUTE_SETTLEMENTS,
        variables: { ids },
      });

      const totalAmount = settlements.reduce(
        (sum: number, s: any) => sum + (s.netAmount || 0),
        0,
      );

      return end(`Distributed ${settlements.length} settlements!
Total: $${totalAmount.toFixed(2)}
Admin: ${admin.fullName}
All businesses have been paid.`);
    }

    // 1*1*2 → Cancel
    else if (text === '1*1*2') {
      return end('Distribution cancelled.');
    }

    // ════════════════════════════════════════════════════════════
    // FLOW 2 — View Settlement Stats
    // ════════════════════════════════════════════════════════════

    else if (text === '2') {
      const statsResult = await executeQuery.query({
        query: GET_SETTLEMENT_STATS,
        variables: {},
        fetchPolicy: 'network-only',
      });
      const stats = statsResult.data?.settlementStats;

      return end(`Settlement Statistics
Pending: ${stats?.pendingCount || 0} ($${stats?.totalPending?.toFixed(2) || '0.00'})
Distributed: ${stats?.distributedCount || 0} ($${stats?.totalDistributed?.toFixed(2) || '0.00'})
Platform Fees: $${stats?.totalPlatformFees?.toFixed(2) || '0.00'}
Delivery Fees: $${stats?.totalDeliveryFees?.toFixed(2) || '0.00'}`);
    }

    // ════════════════════════════════════════════════════════════
    // FLOW 3 — Check Pending Settlements
    // ════════════════════════════════════════════════════════════

    else if (text === '3') {
      const settlementsResult = await executeQuery.query({
        query: GET_SETTLEMENTS,
        variables: { status: 'PENDING', page: 1, limit: 5 },
        fetchPolicy: 'network-only',
      });
      const settlements = settlementsResult.data?.settlements?.items || [];
      const total = settlementsResult.data?.settlements?.total || 0;

      if (settlements.length === 0) {
        return end('No pending settlements.');
      }

      const lines = settlements.map(
        (s: any, i: number) =>
          `${i + 1}. ${s.business?.name || 'Unknown'}: $${s.netAmount?.toFixed(2)}`,
      );

      return con(`Pending Settlements (${total} total):
${lines.join('\n')}
${total > 5 ? `...and ${total - 5} more` : ''}

Enter number to distribute, or 0 to go back`);
    }

    // 3*<number> → Distribute specific settlement
    else if (parts[0] === '3' && depth === 2) {
      const selection = parseInt(parts[1]);

      if (selection === 0) {
        return con(`USCOR Admin Panel
1. Distribute Settlements
2. View Settlement Stats
3. Check Pending Settlements`);
      }

      const settlementsResult = await executeQuery.query({
        query: GET_SETTLEMENTS,
        variables: { status: 'PENDING', page: 1, limit: 5 },
        fetchPolicy: 'network-only',
      });
      const settlements = settlementsResult.data?.settlements?.items || [];
      const selected = settlements[selection - 1];

      if (!selected) {
        return end('Invalid selection.');
      }

      return con(`Distribute to ${selected.business?.name}?
Amount: $${selected.netAmount?.toFixed(2)}
Platform Fee: $${selected.platformFee?.toFixed(2)}
1. Confirm
2. Cancel`);
    }

    // 3*<number>*1 → Confirm distribute single
    else if (parts[0] === '3' && depth === 3 && parts[2] === '1') {
      const selection = parseInt(parts[1]);

      const settlementsResult = await executeQuery.query({
        query: GET_SETTLEMENTS,
        variables: { status: 'PENDING', page: 1, limit: 5 },
        fetchPolicy: 'network-only',
      });
      const settlements = settlementsResult.data?.settlements?.items || [];
      const selected = settlements[selection - 1];

      if (!selected) {
        return end('Settlement not found.');
      }

      await executeQuery.mutate({
        mutation: DISTRIBUTE_SETTLEMENT,
        variables: { id: selected.id },
      });

      return end(`Settlement distributed!
Business: ${selected.business?.name}
Amount: $${selected.netAmount?.toFixed(2)}
Admin: ${admin.fullName}`);
    }

    // 3*<number>*2 → Cancel
    else if (parts[0] === '3' && depth === 3 && parts[2] === '2') {
      return end('Distribution cancelled.');
    }

    else {
      return end('Invalid option. Please try again.');
    }
  } catch (error: any) {
    console.error('USSD Admin Error:', {
      message: error?.message,
      graphQLErrors: error?.graphQLErrors,
    });
    return end('An error occurred. Please try again later.');
  }
}
