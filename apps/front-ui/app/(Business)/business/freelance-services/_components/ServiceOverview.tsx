// app/business/freelance-services/_components/ServiceOverview.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BriefcaseBusiness, Users, Clock, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';

interface ServiceOverviewProps {
  services: any[];
  serviceOrders: any[];
  loading: boolean;
}

export default function ServiceOverview({
  services,
  serviceOrders,
  loading
}: ServiceOverviewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');

  // Sample data for charts - in real app, this would come from analytics
  const ordersByDay = [
    { name: 'Mon', orders: 5 },
    { name: 'Tue', orders: 8 },
    { name: 'Wed', orders: 6 },
    { name: 'Thu', orders: 10 },
    { name: 'Fri', orders: 12 },
    { name: 'Sat', orders: 15 },
    { name: 'Sun', orders: 7 },
  ];

  const calculateStats = useMemo(() => {
    const totalServices = services.length;
    const totalOrders = serviceOrders.length;
    const completedOrders = serviceOrders.filter(o => o.status === 'COMPLETED').length;
    const revenue = serviceOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalServices,
      totalOrders,
      completedOrders,
      revenue,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      avgOrderValue: totalOrders > 0 ? revenue / totalOrders : 0
    };
  }, [services, serviceOrders]);

  if (loading) {
    return (
      <Card>
        <CardContent className="h-[500px] flex items-center justify-center">
          <Loader loading={true} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Service Stats */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-primary" />
              Service Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <BriefcaseBusiness className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Services</span>
                  </div>
                  <p className="text-2xl font-bold">{calculateStats.totalServices}</p>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Orders</span>
                  </div>
                  <p className="text-2xl font-bold">{calculateStats.totalOrders}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-muted-foreground">Completed</span>
                  </div>
                  <p className="text-2xl font-bold">{calculateStats.completedOrders}</p>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                  </div>
                  <p className="text-2xl font-bold">{calculateStats.completionRate.toFixed(1)}%</p>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Revenue</span>
                </div>
                <p className="text-2xl font-bold">${calculateStats.revenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  Avg. order value: ${calculateStats.avgOrderValue.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              { /* sort a copy to avoid mutating props (props arrays can be readonly) */}
              {[...services]
                .sort((a, b) => {
                  const aOrders = serviceOrders.filter(o => o.serviceId === a.id).length;
                  const bOrders = serviceOrders.filter(o => o.serviceId === b.id).length;
                  return bOrders - aOrders;
                })
                .slice(0, 5)
                .map(service => {
                  const serviceOrdersCount = serviceOrders.filter(o => o.serviceId === service.id).length;
                  return (
                    <div key={service.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                          {service.title.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium truncate">{service.title}</p>
                          <p className="text-xs text-muted-foreground">
                            ${service.rate} {service.isHourly ? '/hr' : 'fixed'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{serviceOrdersCount}</p>
                        <p className="text-xs text-muted-foreground">orders</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Charts & Details */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">Service Orders</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={selectedPeriod === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('day')}
              >
                Day
              </Button>
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('week')}
              >
                Week
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('month')}
              >
                Month
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Service Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={services.slice(0, 7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey={(service) => serviceOrders.filter(o => o.serviceId === service.id).length}
                    fill="hsl(var(--primary))"
                    name="Orders"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Most Popular Service</h3>
                {services.length > 0 && (
                  <>
                    <p className="text-2xl font-bold truncate">
                      {services
                        .map(service => ({
                          ...service,
                          orderCount: serviceOrders.filter(o => o.serviceId === service.id).length
                        }))
                        .sort((a, b) => b.orderCount - a.orderCount)[0].title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {services
                        .map(service => ({
                          ...service,
                          orderCount: serviceOrders.filter(o => o.serviceId === service.id).length
                        }))
                        .sort((a, b) => b.orderCount - a.orderCount)[0].orderCount} orders
                    </p>
                  </>
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Highest Revenue Service</h3>
                {services.length > 0 && (
                  <>
                    <p className="text-2xl font-bold truncate">
                      {services
                        .map(service => ({
                          ...service,
                          revenue: serviceOrders
                            .filter(o => o.serviceId === service.id)
                            .reduce((sum, order) => sum + order.totalAmount, 0)
                        }))
                        .sort((a, b) => b.revenue - a.revenue)[0].title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${services
                        .map(service => ({
                          ...service,
                          revenue: serviceOrders
                            .filter(o => o.serviceId === service.id)
                            .reduce((sum, order) => sum + order.totalAmount, 0)
                        }))
                        .sort((a, b) => b.revenue - a.revenue)[0].revenue.toFixed(2)}
                    </p>
                  </>
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Best Completion Rate</h3>
                {services.length > 0 && (
                  <>
                    <p className="text-2xl font-bold truncate">
                      {services
                        .map(service => {
                          const serviceOrderss = serviceOrders.filter(o => o.serviceId === service.id);
                          const completed = serviceOrderss.filter(o => o.status === 'COMPLETED').length;
                          const rate = serviceOrderss.length > 0 ? (completed / serviceOrderss.length) * 100 : 0;
                          return { ...service, completionRate: rate };
                        })
                        .sort((a, b) => b.completionRate - a.completionRate)[0].title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {services
                        .map(service => {
                          const serviceOrderss = serviceOrders.filter(o => o.serviceId === service.id);
                          const completed = serviceOrderss.filter(o => o.status === 'COMPLETED').length;
                          const rate = serviceOrderss.length > 0 ? (completed / serviceOrderss.length) * 100 : 0;
                          return { ...service, completionRate: rate };
                        })
                        .sort((a, b) => b.completionRate - a.completionRate)[0].completionRate.toFixed(1)}%
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}