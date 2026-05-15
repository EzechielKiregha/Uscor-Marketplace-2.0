"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, CheckCircle } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { useMe } from "@/lib/useMe";
import { Address } from "@/lib/types";
import { useMutation, useQuery } from "@apollo/client";
import {
  ADD_CLIENT_ADDRESS,
  GET_CLIENT_PROFILE,
} from "@/graphql/client-panel.gql";

interface AddressSelectorProps {
  selectedAddress?: Address | null;
  onSelect: (address: Address) => void;
  onAddNew: () => void;
}

export default function AddressSelector({
  selectedAddress,
  onSelect,
  onAddNew,
}: AddressSelectorProps) {
  const { user, loading: meLoading } = useMe();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    country: "RWANDA",
    postalCode: "",
    isDefault: false,
  });

  const { data, refetch } = useQuery(GET_CLIENT_PROFILE, {
    variables: { id: user?.id },
  });

  const [addAddress] = useMutation(ADD_CLIENT_ADDRESS);

  useEffect(() => {
    if (user?.id) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      await refetch();

      const addresses: Address[] = data?.client?.addresses || [];

      setAddresses(addresses);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showToast("error", "Error", "Failed to load addresses");
    }
  };

  const handleSelectAddress = (address: Address) => {
    onSelect(address);
    showToast("success", "Address Selected", `Delivery to ${address.street}`);
  };

  const handleSaveNewAddress = async () => {
    if (!newAddress.street || !newAddress.city) {
      showToast("error", "Validation Error", "Street and city are required");
      return;
    }

    try {
      // In a real app, this would save to the database
      const mockAddress: Address = {
        id: Date.now().toString(),
        ...newAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await addAddress({
        variables: {
          clientId: user?.id,
          input: {
            street: newAddress.street,
            city: newAddress.city,
            country: newAddress.country,
            postalCode: newAddress.postalCode,
            isDefault: newAddress.isDefault,
          },
        },
      });

      setAddresses([...addresses, mockAddress]);
      onSelect(mockAddress);
      setShowNewAddressForm(false);
      setNewAddress({
        street: "",
        city: "",
        country: "RWANDA",
        postalCode: "",
        isDefault: false,
      });

      showToast("success", "Address Added", "New delivery address saved");
    } catch (error) {
      showToast("error", "Error", "Failed to save address");
    }
  };

  if (loading || meLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Delivery Address</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewAddressForm(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p>No saved addresses</p>
          <p className="text-sm mt-1">Add a new address to get started</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedAddress?.id === address.id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => handleSelectAddress(address)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{address.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.country}
                  </p>
                  {address.postalCode && (
                    <p className="text-sm text-muted-foreground">
                      Postal Code: {address.postalCode}
                    </p>
                  )}
                  {address.isDefault && (
                    <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium bg-success/10 text-success rounded-full">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Default
                    </span>
                  )}
                </div>
                {selectedAddress?.id === address.id && (
                  <CheckCircle className="h-5 w-5 text-primary mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewAddressForm && (
        <div className="border border-border rounded-lg p-4 mt-4">
          <h4 className="font-medium mb-3">New Address</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={newAddress.street}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, street: e.target.value })
                  }
                  placeholder="123 Main Street"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  placeholder="Kigali"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={newAddress.postalCode}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, postalCode: e.target.value })
                  }
                  placeholder="00000"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAddress.isDefault}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      isDefault: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="isDefault">Set as default address</Label>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowNewAddressForm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-accent text-primary-foreground"
                onClick={handleSaveNewAddress}
              >
                Save Address
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
