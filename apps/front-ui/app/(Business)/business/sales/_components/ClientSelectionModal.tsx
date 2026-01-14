'use client';

import { useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, User, Plus, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { SEARCH_CLIENTS, GET_CLIENT_BY_EMAIL, CREATE_CLIENT_FOR_POS } from '@/graphql/client.gql';

interface Client {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  isVerified: boolean;
}

interface ClientSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientSelected: (client: Client) => void;
}

export default function ClientSelectionModal({
  isOpen,
  onClose,
  onClientSelected
}: ClientSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newClientData, setNewClientData] = useState({
    email: '',
    fullName: '',
    phone: '',
    address: ''
  });
  const { showToast } = useToast();

  const [searchClients, { loading: searchLoading }] = useLazyQuery(SEARCH_CLIENTS, {
    onCompleted: (data) => {
      setSearchResults(data.searchClients || []);
    },
    onError: (error) => {
      showToast('error', 'Search Error', error.message);
    }
  });

  const [getClientByEmail] = useLazyQuery(GET_CLIENT_BY_EMAIL, {
    onCompleted: (data) => {
      if (data.clientByEmail) {
        setSearchResults([data.clientByEmail]);
      } else {
        setSearchResults([]);
        // If no client found by email, pre-fill the create form
        if (isValidEmail(searchQuery)) {
          setNewClientData(prev => ({ ...prev, email: searchQuery }));
          setIsCreating(true);
        }
      }
    },
    onError: (error) => {
      showToast('error', 'Search Error', error.message);
    }
  });

  const [createClientForPOS, { loading: createLoading }] = useMutation(CREATE_CLIENT_FOR_POS, {
    onCompleted: (data) => {
      showToast('success', 'Client Created', 'New client created successfully');
      onClientSelected(data.createClientForPOS);
      handleClose();
    },
    onError: (error) => {
      showToast('error', 'Creation Error', error.message);
    }
  });

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    if (isValidEmail(searchQuery)) {
      // Search by email first
      getClientByEmail({ variables: { email: searchQuery } });
    } else {
      // General search
      searchClients({ variables: { query: searchQuery } });
    }
  };

  const handleCreateClient = () => {
    if (!newClientData.email || !isValidEmail(newClientData.email)) {
      showToast('error', 'Validation Error', 'Please enter a valid email address');
      return;
    }

    createClientForPOS({
      variables: {
        createClientInput: {
          email: newClientData.email,
          fullName: newClientData.fullName || undefined,
          phone: newClientData.phone || undefined,
          address: newClientData.address || undefined,
        }
      }
    });
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsCreating(false);
    setNewClientData({ email: '', fullName: '', phone: '', address: '' });
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select or Create Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={searchLoading || !searchQuery.trim()}
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Search Results</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((client) => (
                    <div
                      key={client.id}
                      className="p-3 border border-orange-400/60 dark:border-orange-500/70 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        onClientSelected(client);
                        handleClose();
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {client.avatar ? (
                            <img src={client.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{client.fullName || client.username}</p>
                            {client.isVerified && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </div>
                            {client.phone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {client.phone}
                              </div>
                            )}
                            {client.address && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {client.address}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchQuery && searchResults.length === 0 && !searchLoading && !isCreating && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No clients found</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    if (isValidEmail(searchQuery)) {
                      setNewClientData(prev => ({ ...prev, email: searchQuery }));
                    }
                    setIsCreating(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Client
                </Button>
              </div>
            )}
          </div>

          {/* Create Client Section */}
          {isCreating && (
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Create New Client</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="client@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={newClientData.fullName}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newClientData.phone}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newClientData.address}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main St, City, Country"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreateClient}
                    disabled={createLoading || !newClientData.email}
                    className="flex-1"
                  >
                    {createLoading ? 'Creating...' : 'Create Client'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    disabled={createLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!isCreating && (
            <div className="border-t pt-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(true)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Client
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onClientSelected(null as any); // No client selected
                    handleClose();
                  }}
                  className="flex-1"
                >
                  Continue Without Client
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}