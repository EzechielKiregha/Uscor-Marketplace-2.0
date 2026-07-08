// app/(Business)/business/stores/[storeId]/_components/StoreShifts.tsx
"use client";

import { useQuery } from "@apollo/client";
import { AlertTriangle, CheckCircle, Clock, User } from "lucide-react";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { GET_STORE_SHIFTS } from "@/graphql/store.gql";

interface StoreShiftsProps {
  storeId: string;
}

export default function StoreShifts({ storeId }: StoreShiftsProps) {
  const { data, loading } = useQuery(GET_STORE_SHIFTS, {
    variables: { storeId },
    skip: !storeId,
  });

  if (loading) return <TableSkeleton />;
  if (!data?.storeShifts) return null;

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted border-b border-border">
          <h2 className="font-semibold">Active & Recent Shifts</h2>
        </div>

        <div className="p-4 space-y-4">
          {data.storeShifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-3" />
              <p>No shifts recorded for this store yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {data.storeShifts.map((shift: any) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-4">
                    {shift.worker.avatar ? (
                      <img
                        src={shift.worker.avatar}
                        alt={shift.worker.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">{shift.worker.fullName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {shift.worker.role}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(shift.startTime).toLocaleString()}
                          {shift.endTime
                            ? ` - ${new Date(shift.endTime).toLocaleString()}`
                            : " (Active)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      {shift.status === "ACTIVE" ? (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                      <span className="text-sm font-medium">
                        ${shift.sales?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-muted rounded-full">
                      {shift.transactionCount || 0} transactions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
