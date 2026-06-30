"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Clock,
  CreditCard,
  DollarSign,
  Filter,
  Search,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import EmptyState, { emptyStateIcons } from "@/components/EmptyState";

interface TransactionHistoryProps {
  transactions: any[];
  loading: boolean;
  userType: string;
  userId: string;
}

export default function TransactionHistory({
  transactions,
  loading,
  userType,
  userId,
}: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      !searchQuery ||
      transaction.id.includes(searchQuery) ||
      transaction.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.origin.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = !filterMethod || transaction.method === filterMethod;
    const matchesStatus = !filterStatus || transaction.status === filterStatus;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "MTN_MOMO":
        return <Smartphone className="h-4 w-4 text-primary" />;
      case "AIRTEL_MONEY":
        return <Smartphone className="h-4 w-4 text-primary" />;
      case "ORANGE_MONEY":
        return <Smartphone className="h-4 w-4 text-primary" />;
      case "MPESA":
        return <Smartphone className="h-4 w-4 text-primary" />;
      case "BANK_TRANSFER":
        return <CreditCard className="h-4 w-4 text-primary" />;
      case "CARD":
        return <CreditCard className="h-4 w-4 text-primary" />;
      default:
        return <DollarSign className="h-4 w-4 text-primary" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "MTN_MOMO":
        return "MTN Mobile Money";
      case "AIRTEL_MONEY":
        return "Airtel Money";
      case "ORANGE_MONEY":
        return "Orange Money";
      case "MPESA":
        return "M-Pesa";
      case "BANK_TRANSFER":
        return "Bank Transfer";
      case "CARD":
        return "Credit/Debit Card";
      default:
        return method;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
            Completed
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "FAILED":
        return (
          <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted border-b border-border">
          <h2 className="font-semibold">Transaction History</h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-4 border-b border-border animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div>
                    <div className="h-4 bg-muted rounded w-24 mb-1" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-muted rounded w-16 mb-1" />
                  <div className="h-3 bg-muted rounded w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-muted border-b border-border">
        <h2 className="font-semibold">Transaction History</h2>
      </div>

      <div className="p-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Methods</option>
              <option value="MTN_MOMO">MTN Mobile Money</option>
              <option value="AIRTEL_MONEY">Airtel Money</option>
              <option value="ORANGE_MONEY">Orange Money</option>
              <option value="MPESA">M-Pesa</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CARD">Credit/Debit Card</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon={emptyStateIcons.revenue}
            title="No transactions found"
            description={searchQuery || filterMethod || filterStatus
              ? "Try adjusting your filters"
              : "Your transaction history will appear here"}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Origin</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(transaction.method)}
                        <span className="font-mono text-xs">
                          {transaction.id.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getMethodLabel(transaction.method)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          transaction.type === "WITHDRAWAL"
                            ? "text-destructive"
                            : "text-primary"
                        }`}
                      >
                        {transaction.type === "WITHDRAWAL" ? "-" : "+"}
                        {transaction.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{transaction.origin}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
