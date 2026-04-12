// app/worker/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_WORKER_PROFILE } from '@/graphql/worker.gql';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart,
  Package,
  Users,
  MessageSquare,
  BarChart,
  Settings,
  Clock,
  X,
  Menu,
  LogOut
} from 'lucide-react';
import Loader from '@/components/seraui/Loader';
import { useMe } from '@/lib/useMe';
import { StoreEntity } from '@/lib/types';
import { useIndexedDB } from '@/hooks/use-indexed-db';
import { GET_STORES } from '@/graphql/store.gql';
import PosPage from './_components/PosPage';
import InventoryPage from './_components/InventoryPage';
import ShiftsPage from './_components/ShiftsPage';
import ChatsPage from './_components/ChatsPage';
import ReportsPage from './_components/ReportsPage';
import ProfilePage from './_components/ProfilePage';


interface WorkerLayoutProps {
  children: React.ReactNode;
}

export default function WorkerLayout({ children }: WorkerLayoutProps) {
  const { user, role, loading: authLoading } = useMe();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'pos' | 'inventory' | 'shifts' | 'chats' | 'reports' | 'profile'>('pos');
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  
  const { data: storesData, loading: storesLoading, error: storesError, refetch: refetchStores } = useQuery(GET_STORES);

  const { 
    data: workerData,
    loading: workerLoading,
    error: workerError 
  } = useQuery(GET_WORKER_PROFILE, {
    variables: { id: user?.id },
    skip: !user?.id
  });

   // Auto-select first store if none selected
    useEffect(() => {
      if (storesData?.stores && storesData.stores.length > 0 && !selectedStoreId) {
        setSelectedStoreId(storesData.stores[0].id);
      }
    }, [storesData, selectedStoreId]);

  const worker = workerData?.worker;
  const { isOnline, syncing } = useIndexedDB();

  if (authLoading || workerLoading || storesLoading) return <Loader loading={true} />;
  if (workerError || storesError) return <div>Error loading worker profile: {workerError?.message || storesError?.message}</div>;
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Worker Access Required</h1>
        <p className="text-muted-foreground mt-2">You need to be logged in as a worker to access this panel.</p>
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
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              {worker?.avatar ? (
                <img 
                  src={worker.avatar} 
                  alt={worker.fullName} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {worker?.fullName?.charAt(0) || 'W'}
                </div>
              )}
              <div>
                <h2 className="font-semibold">{worker?.fullName}</h2>
                <p className="text-xs text-muted-foreground">{worker?.role}</p>
              </div>
            </div>
            
            {worker?.business && (
              <div className="mt-3 p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Business</p>
                <p className="font-medium">{worker.business.name}</p>
                <p className="text-xs text-muted-foreground">
                  {worker.business.businessType === 'ARTISAN' && '🎨 Artisan & Handcrafted Goods'}
                  {worker.business.businessType === 'BOOKSTORE' && '📚 Bookstore & Stationery'}
                  {worker.business.businessType === 'ELECTRONICS' && '🔌 Electronics & Gadgets'}
                  {worker.business.businessType === 'HARDWARE' && '🔨 Hardware & Tools'}
                  {worker.business.businessType === 'GROCERY' && '🛒 Grocery & Convenience'}
                  {worker.business.businessType === 'CAFE' && '☕ Café & Coffee Shops'}
                  {worker.business.businessType === 'RESTAURANT' && '🍽️ Restaurant & Dining'}
                  {worker.business.businessType === 'RETAIL' && '🏬 Retail & General Stores'}
                  {worker.business.businessType === 'BAR' && '🍷 Bar & Pub'}
                  {worker.business.businessType === 'CLOTHING' && '👕 Clothing & Accessories'}
                </p>

                {/* Store Selection */}
                {storesData?.stores && storesData.stores.length > 1 && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <label className="block text-sm font-medium mb-1">Select Store</label>
                        <select
                          value={selectedStoreId || ''}
                          onChange={(e) => setSelectedStoreId(e.target.value)}
                          className="p-2 border border-border rounded-md"
                        >
                          <option value="">Select a store</option>
                          {storesData?.stores.map((store: StoreEntity) => (
                            <option key={store.id} value={store.id}>
                              {store.name} - {store.address}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
        </div>
      )}
      
      {/* Online Status */}
      <div className="mt-3 flex items-center gap-2 p-2 bg-muted rounded-lg">
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-success' : 'bg-warning'}`}></div>
        <span className="text-xs">
          {isOnline ? 'Online' : 'Offline'}
        </span>
        {syncing && (
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin ml-auto"></div>
        )}
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 p-2">
      <div className="space-y-1">
        <Button
          variant={activeSection === 'pos' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            setActiveSection('pos');
            setIsSidebarOpen(false);
          }}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Point of Sale
        </Button>
        
        <Button
          variant={activeSection === 'inventory' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            setActiveSection('inventory');
            setIsSidebarOpen(false);
          }}
        >
          <Package className="h-4 w-4 mr-2" />
          Inventory
        </Button>
        
        <Button
          variant={activeSection === 'shifts' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            setActiveSection('shifts');
            setIsSidebarOpen(false);
          }}
        >
          <Clock className="h-4 w-4 mr-2" />
          Shifts
        </Button>
        
        <Button
          variant={activeSection === 'chats' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            setActiveSection('chats');
            setIsSidebarOpen(false);
          }}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Chats
        </Button>
        
        <Button
          variant={activeSection === 'reports' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            setActiveSection('reports');
            setIsSidebarOpen(false);
          }}
        >
          <BarChart className="h-4 w-4 mr-2" />
          Reports
        </Button>
        
        <Button
          variant={activeSection === 'profile' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            setActiveSection('profile');
            setIsSidebarOpen(false);
          }}
        >
          <Settings className="h-4 w-4 mr-2" />
          Profile
        </Button>
      </div>
    </nav>

    {/* Sidebar Footer */}
    <div className="p-4 border-t border-border">
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={() => {
          // In a real app, this would handle logout
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Log Out
      </Button>
    </div>
  </div>
</div>

{/* Overlay for mobile */}
{isSidebarOpen && (
  <div 
    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
    onClick={() => setIsSidebarOpen(false)}
  ></div>
)}

      {/* Main Content */}
      <div className="md:ml-64">
        <div className="container mx-auto px-4 py-8">
          {activeSection === 'pos' && <PosPage selectedStoreId={selectedStoreId} />}
          {activeSection === 'inventory' && <InventoryPage selectedStoreId={selectedStoreId} />}
          {activeSection === 'shifts' && <ShiftsPage selectedStoreId={selectedStoreId}/>}
          {activeSection === 'chats' && <ChatsPage />}
          {activeSection === 'reports' && <ReportsPage selectedStoreId={selectedStoreId} />}
          {activeSection === 'profile' && <ProfilePage />}
        </div>
      </div>
    </div>
  );
}