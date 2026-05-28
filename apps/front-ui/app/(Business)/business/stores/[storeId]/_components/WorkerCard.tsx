// app/(Business)/business/stores/[storeId]/_components/WorkerCard.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Clock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

interface WorkerCardProps {
  worker: any;
  onView: () => void;
}

export default function WorkerCard({ worker, onView }: WorkerCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        {worker.avatar ? (
          <img
            src={worker.avatar}
            alt={worker.fullName}
            className="w-12 h-12 rounded-full object-cover border-2 border-border"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
            {worker.fullName.charAt(0)}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{worker.fullName}</h4>
            {worker.isVerified && (
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{worker.role}</p>

          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" /> {worker.email}
            </span>
            {worker.phone && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" /> {worker.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Current Status</p>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              worker.currentShift
                ? "bg-success/10 text-success"
                : "bg-warning/10 text-warning"
            }`}
          >
            {worker.currentShift ? "On Shift" : "Off Shift"}
          </span>
        </div>
        <Button variant="outline" size="icon" onClick={onView}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
