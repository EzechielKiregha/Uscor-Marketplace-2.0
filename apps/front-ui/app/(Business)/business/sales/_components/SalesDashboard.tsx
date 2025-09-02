// app/business/sales/_components/SalesDashboard.tsx
'use client';

import { useQuery } from '@apollo/client';
import { GET_SALES_DASHBOARD } from '@/graphql/sales.gql';
import Loader from '@/components/seraui/Loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, LineChart } from 'recharts';
import { DollarSign, TrendingUp, Package, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface SalesDashboardProps {
  storeId: string;
}

export default function SalesDashboard({ storeId }: SalesDashboardProps) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery(GET_SALES_DASHBOARD, {
    variables: {
      storeId,
      period
    },
    skip: !storeId
  });

  useEffect(() => {
    if (storeId) {
      refetch();
    }
  }, [storeId, period, refetch]);

  if (loading) return (
    <Card>
      <CardContent className="h-[300px] flex items-center justify-center">
        <Loader loading={true} />
      </CardContent>
    </Card>
  );

  if (error) return (
    <Card>
      <CardContent className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-2">Error loading dashboard</div>
          <button
            className="text-primary hover:underline"
            onClick={() => refetch()}
          >
            Try Again
          </button>
        </div>
      </CardContent>
    </Card>
  );

  const dashboardData = data?.salesDashboard;
  const chartData = dashboardData?.chartData || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Sales Dashboard</CardTitle>
        <div className="flex gap-1">
          <Button
            variant={period === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('day')}
          >
            Day
          </Button>
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('week')}
          >
            Week
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('month')}
          >
            Month
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Sales</span>
            </div>
            <p className="text-2xl font-bold">${dashboardData?.totalRevenue?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-muted-foreground">+{dashboardData?.totalSales || 0} sales</p>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Avg. Ticket</span>
            </div>
            <p className="text-2xl font-bold">${dashboardData?.averageTicket?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-muted-foreground">per transaction</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
              <span>Sales ($)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-muted-foreground opacity-60"></div>
              <span>Transactions</span>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'sales' ? `$${Number(value).toFixed(2)}` : `${value} transactions`,
                    name === 'sales' ? 'Sales' : 'Transactions'
                  ]}
                />
                <Bar yAxisId="left" dataKey="sales" fill="hsl(var(--primary))" />
                <Bar yAxisId="right" dataKey="transactions" fill="hsl(var(--muted-foreground))" opacity={0.6} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Top Products</h3>
          <div className="space-y-3">
            {dashboardData?.topProducts?.slice(0, 3).map((product: any) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="truncate">{product.title}</span>
                </div>
                <span className="font-medium">{product.quantitySold} sold</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}