// app/client/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CLIENT_PROFILE } from '@/graphql/client-panel.gql';
import { Button } from '@/components/ui/button';
import {
  Home,
  ShoppingBag,
  Star,
  Gift,
  MessageSquare,
  User,
  Settings,
  BriefcaseBusiness,
  ShieldCheck
} from 'lucide-react';
import ProfileOverview from './_components/ProfileOverview';
import OrderHistory from './_components/OrderHistory';
import LoyaltyDashboard from './_components/LoyaltyDashboard';
import Recommendations from './_components/Recommendations';
import Reviews from './_components/Reviews';
import SettingsPanel from './_components/SettingsPanel';
import Loader from '@/components/seraui/Loader';
import { useMe } from '@/lib/useMe';
import HeaderComponent from '@/components/seraui/HeaderComponent';
import ClientChatsPage from './_components/ClientChatPage';

export default function ClientPanel() {
  const { user, loading: authLoading } = useMe();
  const [activeSection, setActiveSection] = useState<'profile' | 'chat' | 'orders' | 'loyalty' | 'recommendations' | 'reviews' | 'settings'>('profile');

  const {
    data: clientData,
    loading: clientLoading,
    error: clientError
  } = useQuery(GET_CLIENT_PROFILE, {
    variables: { id: user?.id },
    skip: !user?.id
  });

  if (authLoading || clientLoading) return <Loader loading={true} />;
  if (clientError) return <div>Error loading client data: {clientError.message}</div>;
  if (!user || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Client Access Required</h1>
        <p className="text-muted-foreground mt-2">You need to be logged in as a customer to access this panel.</p>
        <Button
          variant="default"
          className="mt-4"
          onClick={() => window.location.href = '/login'}
        >
          Log In
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden sticky top-8">
              <div className="p-4 bg-muted border-b border-border">
                <h2 className="font-semibold">Client Dashboard</h2>
              </div>

              <div className="p-4 space-y-1">
                <Button
                  variant={activeSection === 'profile' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('profile')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile Overview
                </Button>

                <Button
                  variant={activeSection === 'chat' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('chat')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  My Chats
                </Button>

                <Button
                  variant={activeSection === 'orders' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('orders')}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Order History
                </Button>

                <Button
                  variant={activeSection === 'loyalty' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('loyalty')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Loyalty Program
                </Button>

                <Button
                  variant={activeSection === 'recommendations' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('recommendations')}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Recommendations
                </Button>

                <Button
                  variant={activeSection === 'reviews' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('reviews')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reviews
                </Button>

                <Button
                  variant={activeSection === 'settings' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/marketplace'}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Marketplace
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/b-all?loyalty=true'}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Find Loyalty Businesses
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/b-all?promotions=true'}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  View Available Promotions
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/b-all?b2b=true'}
                >
                  <BriefcaseBusiness className="h-4 w-4 mr-2" />
                  Find B2B Businesses
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/b-all?verified=true'}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Verified Businesses
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {activeSection === 'profile' && <ProfileOverview client={clientData.client} />}
            {activeSection === 'chat' && <ClientChatsPage client={clientData.client} />}
            {activeSection === 'orders' && <OrderHistory client={clientData.client} />}
            {activeSection === 'loyalty' && <LoyaltyDashboard client={clientData.client} />}
            {activeSection === 'recommendations' && <Recommendations client={clientData.client} />}
            {activeSection === 'reviews' && <Reviews client={clientData.client} />}
            {activeSection === 'settings' && <SettingsPanel client={clientData.client} />}
          </div>
        </div>
      </div>
    </div>
  );
}