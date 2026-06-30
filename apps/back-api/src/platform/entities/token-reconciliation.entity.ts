import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class TokenHolderBalance {
    @Field() id: string;
    @Field() name: string;
    @Field() type: string; // "business" or "client"
    @Field(() => Float) tokenBalance: number;
    @Field(() => Float) rechargeBalance: number;
    @Field(() => Int) transactionCount: number;
}

@ObjectType()
export class TokenReconciliation {
    // Supply side
    @Field(() => Float) totalTokensIssued: number;
    @Field(() => Float) totalTokensRedeemed: number;
    @Field(() => Float) totalTokensReleased: number;
    @Field(() => Float) totalTokensPending: number;
    @Field(() => Float) totalTokensReserved: number;

    // Wallet side (recharge balances where method = TOKEN)
    @Field(() => Float) totalWalletTokenBalance: number;
    @Field(() => Float) totalBusinessTokenBalance: number;
    @Field(() => Float) totalClientTokenBalance: number;

    // Ledger side
    @Field(() => Float) totalLedgerCredits: number;
    @Field(() => Float) totalLedgerDebits: number;
    @Field(() => Float) ledgerNetBalance: number;

    // Reconciliation
    @Field(() => Float) discrepancy: number;
    @Field() isBalanced: boolean;
    @Field() reconciliationDate: Date;

    // Top holders
    @Field(() => [TokenHolderBalance]) topHolders: TokenHolderBalance[];

    // Stats
    @Field(() => Int) totalTokenTransactions: number;
    @Field(() => Int) totalRechargeTransactions: number;
    @Field(() => Int) totalLedgerEntries: number;
}
