"use client";
import Loader from "@/components/seraui/Loader";
import { Button } from "@/components/ui/button";
import { GET_REPORT_HISTORY } from "@/graphql/store.gql";
import { useQuery } from "@apollo/client";
import {
  Clock,
  Crown,
  DollarSign,
  LayoutDashboard,
  Package2,
  RefreshCcwDot,
  Users,
} from "lucide-react";
import { use, useState } from "react";
import { ReportCard } from "./_components/ReportCard";
import { ReportHistory } from "./_components/ReportHistory";

const REPORT_TYPES = [
  {
    id: "STORE_OVERVIEW",
    name: "Store Overview",
    desc: "Full business snapshot with metrics, inventory & shifts",
    icon: LayoutDashboard,
  },
  {
    id: "SALES_PERFORMANCE",
    name: "Sales Performance",
    desc: "Top products, daily trends & payment breakdowns",
    icon: DollarSign,
  },
  {
    id: "WORKER_PERFORMANCE",
    name: "Worker Performance",
    desc: "Shifts, hours & revenue per employee",
    icon: Users,
  },
  {
    id: "INVENTORY",
    name: "Inventory Status",
    desc: "Stock levels, adjustments & order summaries",
    icon: Package2,
  },
  {
    id: "CLIENT_LOYALTY",
    name: "Client & Loyalty",
    desc: "Top clients, points earned & program stats",
    icon: Crown,
  },
  {
    id: "SHIFTS",
    name: "Shifts Report",
    desc: "Detailed shift logs with duration & sales",
    icon: Clock,
  },
  {
    id: "ORDERS_TRANSFERS",
    name: "Orders & Transfers",
    desc: "Purchase & transfer order tracking",
    icon: RefreshCcwDot,
  },
];

interface ReportsPageProps {
  params: Promise<{ storeId: string }>;
}

export default function ReportsPage({ params }: ReportsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const { storeId } = use(params);

  const { data, loading } = useQuery(GET_REPORT_HISTORY, {
    variables: { storeId: storeId },
  });

  if (loading) return <Loader loading={true} />;

  return (
    <div className=" space-y-6">
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => (window.location.href = `/business/stores/${storeId}`)}
      >
        Back
      </Button>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Report Management</h1>

        <div className="font-semibold flex items-center gap-2">
          {["week", "month", "quarter", "year"].map((p, idx) => (
            // <button
            //   key={p}
            //   onClick={() => setSelectedPeriod(p)}
            //   className={`px-3 py-1.5 text-sm rounded-md transition ${selectedPeriod === p ? "bg-white shadow text-orange-600 font-medium" : "text-gray-600"}`}
            // >

            // </button>
            <Button
              key={idx}
              variant={selectedPeriod === p ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORT_TYPES.map((report, idx) => (
          <ReportCard
            key={report.id}
            report={report}
            storeId={storeId}
            period={selectedPeriod}
          />
        ))}
      </div>

      {data?.reportHistory.length > 0 && (
        <ReportHistory reports={data?.reportHistory} />
      )}
    </div>
  );
}
