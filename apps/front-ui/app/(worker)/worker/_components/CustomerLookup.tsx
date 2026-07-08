"use client";

import { useLazyQuery, useMutation } from "@apollo/client";
import {
    Mail,
    Phone,
    Plus,
    Search,
    User,
    UserCheck,
    Users,
    WifiOff,
    X
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    CREATE_CLIENT_FOR_POS,
    GET_CLIENTS,
    SEARCH_CLIENTS,
} from "@/graphql/client.gql";
import {
    getAllFromIndexedDB,
    initDB,
    saveToIndexedDB,
} from "@/lib/indexed-db";

// ─── Types ─────────────────────────────────────────────

interface CachedClient {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  isVerified: boolean;
  cachedAt: string;
}

interface CustomerLookupProps {
  storeId: string;
  isOnline: boolean;
  onClientSelected: (client: CachedClient | null) => void;
  selectedClient?: CachedClient | null;
}

// ─── IndexedDB Client Cache ───────────────────────────

const CLIENT_CACHE_KEY = "workerCache";
const CLIENT_PREFIX = "client_";

async function cacheClients(clients: any[]): Promise<void> {
  await initDB();
  for (const client of clients) {
    await saveToIndexedDB(CLIENT_CACHE_KEY, {
      key: `${CLIENT_PREFIX}${client.id}`,
      data: {
        id: client.id,
        username: client.username,
        email: client.email,
        fullName: client.fullName,
        phone: client.phone,
        address: client.address,
        avatar: client.avatar,
        isVerified: client.isVerified,
        cachedAt: new Date().toISOString(),
      } as CachedClient,
      timestamp: new Date().toISOString(),
    });
  }
}

async function getCachedClients(): Promise<CachedClient[]> {
  try {
    const allItems = await getAllFromIndexedDB(CLIENT_CACHE_KEY);
    return allItems
      .filter((item: any) => item.key?.startsWith(CLIENT_PREFIX))
      .map((item: any) => item.data as CachedClient);
  } catch {
    return [];
  }
}

async function searchCachedClients(query: string): Promise<CachedClient[]> {
  const clients = await getCachedClients();
  const q = query.toLowerCase();
  return clients.filter(
    (c) =>
      c.email?.toLowerCase().includes(q) ||
      c.fullName?.toLowerCase().includes(q) ||
      c.username?.toLowerCase().includes(q) ||
      c.phone?.includes(q),
  );
}

// ─── Component ─────────────────────────────────────────

export default function CustomerLookup({
  storeId,
  isOnline,
  onClientSelected,
  selectedClient,
}: CustomerLookupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<CachedClient[]>([]);
  const [recentClients, setRecentClients] = useState<CachedClient[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [newClientData, setNewClientData] = useState({
    email: "",
    fullName: "",
    phone: "",
  });

  const { showToast } = useToast();

  // Online search
  const [searchOnline, { loading: searchLoading }] = useLazyQuery(
    SEARCH_CLIENTS,
    {
      onCompleted: (data) => {
        const clients = data.searchClients || [];
        setResults(clients);
        // Cache results for offline use
        if (clients.length > 0) {
          cacheClients(clients);
        }
      },
    },
  );

  // Fetch all clients for caching
  const [fetchAllClients] = useLazyQuery(GET_CLIENTS, {
    onCompleted: (data) => {
      const clients = data.clients || [];
      if (clients.length > 0) {
        cacheClients(clients);
        setRecentClients(clients.slice(0, 5));
      }
    },
  });

  // Create client
  const [createClient, { loading: createLoading }] = useMutation(
    CREATE_CLIENT_FOR_POS,
    {
      onCompleted: (data) => {
        const newClient = data.createClientForPOS;
        showToast("success", "Client Created", `${newClient.fullName || newClient.email} created`);
        cacheClients([newClient]);
        onClientSelected(newClient);
        setIsCreating(false);
        setNewClientData({ email: "", fullName: "", phone: "" });
        setExpanded(false);
      },
      onError: (error) => {
        showToast("error", "Error", error.message);
      },
    },
  );

  // Cache clients on mount when online
  useEffect(() => {
    if (isOnline) {
      fetchAllClients();
    } else {
      // Load recent from cache
      getCachedClients().then((clients) => {
        setRecentClients(clients.slice(0, 5));
      });
    }
  }, [isOnline, fetchAllClients]);

  // Search handler
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    if (isOnline) {
      searchOnline({ variables: { query: searchQuery } });
    } else {
      // Offline: search cached clients
      const cached = await searchCachedClients(searchQuery);
      setResults(cached);
    }
  }, [searchQuery, isOnline, searchOnline]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, handleSearch]);

  const handleCreateClient = () => {
    if (!newClientData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientData.email)) {
      showToast("error", "Validation", "Please enter a valid email address");
      return;
    }

    createClient({
      variables: {
        createClientInput: {
          email: newClientData.email,
          fullName: newClientData.fullName || undefined,
          phone: newClientData.phone || undefined,
        },
      },
    });
  };

  // Collapsed view: show selected client or "Select Client" button
  if (!expanded) {
    return (
      <div className="bg-card border border-border rounded-lg p-3">
        {selectedClient ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {selectedClient.fullName || selectedClient.username}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {selectedClient.email}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setExpanded(true)}
              >
                Change
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onClientSelected(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={() => setExpanded(true)}
          >
            <User className="h-3.5 w-3.5 mr-1.5" />
            Select Customer (Optional)
          </Button>
        )}
      </div>
    );
  }

  // Expanded view: search + results
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Customer Lookup</h3>
          {!isOnline && (
            <Badge variant="secondary" className="text-xs gap-1">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            setExpanded(false);
            setSearchQuery("");
            setResults([]);
            setIsCreating(false);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-sm pl-8"
            autoFocus
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          {searchLoading && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Results / Recent */}
      <div className="max-h-48 overflow-y-auto">
        {/* Search Results */}
        {results.length > 0 && (
          <div className="divide-y divide-border">
            {results.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  onClientSelected(client);
                  setExpanded(false);
                  setSearchQuery("");
                  setResults([]);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {client.fullName || client.username}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </span>
                    {client.phone && (
                      <span className="flex items-center gap-0.5">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </span>
                    )}
                  </div>
                </div>
                {client.isVerified && (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    Verified
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {searchQuery && results.length === 0 && !searchLoading && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">No customers found</p>
          </div>
        )}

        {/* Recent Clients (when no search) */}
        {!searchQuery && !isCreating && recentClients.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground px-3 pt-2">Recent</p>
            <div className="divide-y divide-border">
              {recentClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    onClientSelected(client);
                    setExpanded(false);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center shrink-0">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate">
                      {client.fullName || client.username}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {client.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Client Form */}
      {isCreating ? (
        <div className="p-3 border-t border-border space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Plus className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">New Customer</h4>
          </div>
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Email *</Label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={newClientData.email}
                onChange={(e) =>
                  setNewClientData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Full Name</Label>
              <Input
                placeholder="John Doe"
                value={newClientData.fullName}
                onChange={(e) =>
                  setNewClientData((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input
                placeholder="+250..."
                value={newClientData.phone}
                onChange={(e) =>
                  setNewClientData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={handleCreateClient}
              disabled={createLoading || !newClientData.email}
            >
              {createLoading ? "Creating..." : "Create"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-border flex gap-2">
          {isOnline && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => {
                if (searchQuery && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchQuery)) {
                  setNewClientData((prev) => ({ ...prev, email: searchQuery }));
                }
                setIsCreating(true);
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              New Customer
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={() => {
              onClientSelected(null);
              setExpanded(false);
              setSearchQuery("");
            }}
          >
            Skip
          </Button>
        </div>
      )}
    </div>
  );
}
