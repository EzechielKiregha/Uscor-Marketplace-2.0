// app/client/_components/SettingsPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import {
  UPDATE_CLIENT_PROFILE,
  ADD_CLIENT_ADDRESS,
  UPDATE_CLIENT_ADDRESS,
  DELETE_CLIENT_ADDRESS,
  ADD_CLIENT_PAYMENT_METHOD
} from '@/graphql/client-panel.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Loader2,
  X,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useMe } from '@/lib/useMe';

interface SettingsPanelProps {
  client: any;
}

export default function SettingsPanel({ client }: SettingsPanelProps) {
  const { user } = useMe();
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<'profile' | 'addresses' | 'payment'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);

  const [updateProfile] = useMutation(UPDATE_CLIENT_PROFILE);
  const [addAddress] = useMutation(ADD_CLIENT_ADDRESS);
  const [updateAddress] = useMutation(UPDATE_CLIENT_ADDRESS);
  const [deleteAddress] = useMutation(DELETE_CLIENT_ADDRESS);
  const [addPaymentMethod] = useMutation(ADD_CLIENT_PAYMENT_METHOD);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    marketingOptIn: true
  });

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    country: 'RWANDA',
    postalCode: '',
    isDefault: false
  });

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    type: 'MOBILE_MONEY',
    last4: '',
    provider: 'MTN_MOMO',
    isDefault: false
  });

  useEffect(() => {
    setProfileForm({
      fullName: client.fullName,
      email: client.email,
      phone: client.phone || '',
      marketingOptIn: true // In real app, this would come from settings
    });
  }, [client]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, ariaChecked } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? ariaChecked ?? false : value
    }));
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleProfileSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, ariaChecked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? ariaChecked : value
    }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, ariaChecked } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? ariaChecked : value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile({
        variables: {
          input: {
            id: client.id,
            fullName: profileForm.fullName,
            phone: profileForm.phone
          }
        }
      });

      showToast('success', 'Success', 'Profile updated successfully');
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingAddress) {
        await updateAddress({
          variables: {
            addressId: editingAddress.id,
            input: {
              street: addressForm.street,
              city: addressForm.city,
              country: addressForm.country,
              postalCode: addressForm.postalCode,
              isDefault: addressForm.isDefault
            }
          }
        });
        showToast('success', 'Success', 'Address updated successfully');
      } else {
        await addAddress({
          variables: {
            clientId: client.id,
            input: {
              street: addressForm.street,
              city: addressForm.city,
              country: addressForm.country,
              postalCode: addressForm.postalCode,
              isDefault: addressForm.isDefault
            }
          }
        });
        showToast('success', 'Success', 'Address added successfully');
      }

      setShowAddressModal(false);
      setEditingAddress(null);
      setAddressForm({
        street: '',
        city: '',
        country: 'RWANDA',
        postalCode: '',
        isDefault: false
      });
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addPaymentMethod({
        variables: {
          clientId: client.id,
          input: {
            type: paymentForm.type,
            last4: paymentForm.last4,
            provider: paymentForm.provider,
            isDefault: paymentForm.isDefault
          }
        }
      });

      showToast('success', 'Success', 'Payment method added successfully');
      setShowPaymentModal(false);
      setPaymentForm({
        type: 'MOBILE_MONEY',
        last4: '',
        provider: 'MTN_MOMO',
        isDefault: false
      });
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to add payment method');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress({
          variables: { addressId }
        });

        showToast('success', 'Success', 'Address deleted successfully');
      } catch (error: any) {
        showToast('error', 'Error', error.message || 'Failed to delete address');
      }
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setAddressForm({
      street: address.street,
      city: address.city,
      country: address.country,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    });
    setShowAddressModal(true);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Navigation */}
      <div className="p-4 bg-muted border-b border-border">
        <div className="flex flex-wrap gap-1">
          <Button
            variant={activeSection === 'profile' ? 'default' : 'outline'}
            onClick={() => setActiveSection('profile')}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profile Settings
          </Button>
          <Button
            variant={activeSection === 'addresses' ? 'default' : 'outline'}
            onClick={() => setActiveSection('addresses')}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Addresses
          </Button>
          <Button
            variant={activeSection === 'payment' ? 'default' : 'outline'}
            onClick={() => setActiveSection('payment')}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {activeSection === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Profile Settings</h2>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={profileForm.fullName}
                    onChange={handleProfileChange}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  placeholder="+250 788 123 456"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="marketingOptIn"
                  name="marketingOptIn"
                  checked={profileForm.marketingOptIn}
                  onChange={handleProfileChange}
                  className="h-4 w-4 text-primary border-border rounded"
                />
                <label htmlFor="marketingOptIn" className="ml-2 text-sm">
                  Receive marketing emails and promotional offers
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setProfileForm({
                      fullName: client.fullName,
                      email: client.email,
                      phone: client.phone || '',
                      marketingOptIn: true
                    });
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-accent text-primary-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeSection === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">Saved Addresses</h2>
                <p className="text-muted-foreground mt-1">
                  Manage your delivery and billing addresses
                </p>
              </div>
              <Button
                variant="default"
                onClick={() => {
                  setEditingAddress(null);
                  setAddressForm({
                    street: '',
                    city: '',
                    country: 'RWANDA',
                    postalCode: '',
                    isDefault: false
                  });
                  setShowAddressModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </div>

            {client.addresses && client.addresses.length > 0 ? (
              <div className="space-y-4">
                {client.addresses.map((address: any) => (
                  <div
                    key={address.id}
                    className={`border rounded-lg p-4 ${address.isDefault ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <h3 className="font-medium">
                            {address.isDefault ? 'Default Address' : 'Address'}
                          </h3>
                        </div>
                        <p>{address.street}</p>
                        <p>{address.city}, {address.country}</p>
                        {address.postalCode && (
                          <p>Postal Code: {address.postalCode}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditAddress(address)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            handleDeleteAddress(address.id)
                            client.addresses.pop(address)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No addresses saved</h3>
                <p className="text-muted-foreground mb-6">
                  Add an address for faster checkout and delivery
                </p>

                <Button
                  variant="default"
                  className="flex items-center gap-2"
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressForm({
                      street: '',
                      city: '',
                      country: 'RWANDA',
                      postalCode: '',
                      isDefault: false
                    });
                    setShowAddressModal(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add First Address
                </Button>
              </div>
            )}

            {/* Address Modal */}
            {showAddressModal && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-lg w-full max-w-md">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-bold">
                          {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {editingAddress
                            ? 'Update your saved address'
                            : 'Add a new address for delivery and billing'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setShowAddressModal(false);
                          setEditingAddress(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <form onSubmit={handleAddressSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="street" className="block text-sm font-medium mb-1">
                          Street Address
                        </label>
                        <Input
                          id="street"
                          name="street"
                          value={addressForm.street}
                          onChange={handleAddressChange}
                          placeholder="123 Main Street"
                        />
                      </div>

                      <div>
                        <label htmlFor="city" className="block text-sm font-medium mb-1">
                          City
                        </label>
                        <Input
                          id="city"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          placeholder="Kigali"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium mb-1">
                            Country
                          </label>
                          <select
                            id="country"
                            name="country"
                            value={addressForm.country}
                            onChange={handleAddressChange}
                            className="w-full p-2 border border-border rounded-md"
                          >
                            <option value="RWANDA">Rwanda</option>
                            <option value="UGANDA">Uganda</option>
                            <option value="KENYA">Kenya</option>
                            <option value="TANZANIA">Tanzania</option>
                            <option value="DRC">Democratic Republic of Congo</option>
                            <option value="BURUNDI">Burundi</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                            Postal Code
                          </label>
                          <Input
                            id="postalCode"
                            name="postalCode"
                            value={addressForm.postalCode}
                            onChange={handleAddressChange}
                            placeholder="00000"
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isDefault"
                          name="isDefault"
                          checked={addressForm.isDefault}
                          onChange={handleAddressChange}
                          className="h-4 w-4 text-primary border-border rounded"
                        />
                        <label htmlFor="isDefault" className="ml-2 text-sm">
                          Set as default address
                        </label>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowAddressModal(false);
                            setEditingAddress(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-primary hover:bg-accent text-primary-foreground"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : 'Save Address'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'payment' && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">Payment Methods</h2>
                <p className="text-muted-foreground mt-1">
                  Manage your payment options for faster checkout
                </p>
              </div>
              <Button
                variant="default"
                onClick={() => {
                  setEditingPayment(null);
                  setPaymentForm({
                    type: 'MOBILE_MONEY',
                    last4: '',
                    provider: 'MTN_MOMO',
                    isDefault: false
                  });
                  setShowPaymentModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            {client.paymentMethods && client.paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {client.paymentMethods.map((method: any) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 ${method.isDefault ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="h-4 w-4 text-primary" />
                          <h3 className="font-medium">
                            {method.isDefault ? 'Default Payment Method' : 'Payment Method'}
                          </h3>
                        </div>
                        <p>
                          {method.type === 'MOBILE_MONEY' ? 'Mobile Money' :
                            method.type === 'CARD' ? 'Credit Card' : 'Payment Method'}
                          {method.last4 && ` •••• ${method.last4}`}
                        </p>
                        {method.type === 'MOBILE_MONEY' && (
                          <p>Provider: {method.provider.replace('_', ' ')}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingPayment(method);
                            setPaymentForm({
                              type: method.type,
                              last4: method.last4,
                              provider: method.provider,
                              isDefault: method.isDefault
                            });
                            setShowPaymentModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            // In a real app, this would delete the payment method
                            showToast('info', 'Not Implemented', 'Payment method deletion would happen here');
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No payment methods saved</h3>
                <p className="text-muted-foreground mb-6">
                  Add a payment method for faster checkout
                </p>

                <Button
                  variant="default"
                  className="flex items-center gap-2"
                  onClick={() => {
                    setEditingPayment(null);
                    setPaymentForm({
                      type: 'MOBILE_MONEY',
                      last4: '',
                      provider: 'MTN_MOMO',
                      isDefault: false
                    });
                    setShowPaymentModal(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add First Payment Method
                </Button>
              </div>
            )}

            {/* Payment Method Modal */}
            {showPaymentModal && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-lg w-full max-w-md">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-bold">
                          {editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {editingPayment
                            ? 'Update your payment details'
                            : 'Add a new payment method for faster checkout'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setShowPaymentModal(false);
                          setEditingPayment(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium mb-1">
                          Payment Type
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={paymentForm.type}
                          onChange={handlePaymentChange}
                          className="w-full p-2 border border-border rounded-md"
                        >
                          <option value="MOBILE_MONEY">Mobile Money</option>
                          <option value="CREDIT_CARD">Credit Card</option>
                        </select>
                      </div>

                      {paymentForm.type === 'MOBILE_MONEY' ? (
                        <div>
                          <label htmlFor="provider" className="block text-sm font-medium mb-1">
                            Mobile Money Provider
                          </label>
                          <select
                            id="provider"
                            name="provider"
                            value={paymentForm.provider}
                            onChange={handlePaymentChange}
                            className="w-full p-2 border border-border rounded-md"
                          >
                            <option value="MTN_MOMO">MTN Mobile Money</option>
                            <option value="AIRTEL_MONEY">Airtel Money</option>
                            <option value="ORANGE_MONEY">Orange Money</option>
                            <option value="MPESA">M-Pesa</option>
                          </select>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Enter your mobile money number when you make a payment
                          </p>
                        </div>
                      ) : (
                        <div>
                          <label htmlFor="last4" className="block text-sm font-medium mb-1">
                            Card Number
                          </label>
                          <Input
                            id="last4"
                            name="last4"
                            value={paymentForm.last4}
                            onChange={handlePaymentChange}
                            placeholder="1234"
                            maxLength={4}
                          />
                          <p className="mt-1 text-xs text-muted-foreground">
                            Only the last 4 digits are stored for security
                          </p>
                        </div>
                      )}

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isDefault"
                          name="isDefault"
                          checked={paymentForm.isDefault}
                          onChange={handlePaymentChange}
                          className="h-4 w-4 text-primary border-border rounded"
                        />
                        <label htmlFor="isDefault" className="ml-2 text-sm">
                          Set as default payment method
                        </label>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowPaymentModal(false);
                            setEditingPayment(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-primary hover:bg-accent text-primary-foreground"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : 'Save Payment Method'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* East Africa Payment Information */}
            <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Payment Methods in East Africa</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mobile money is the preferred payment method across East Africa.
                    We support all major mobile money providers for secure and convenient
                    transactions.
                  </p>

                  <div className="mt-3 p-3 bg-background rounded-lg border border-border">
                    <p className="text-sm">
                      <span className="font-medium">Pro Tip:</span> For most East African
                      businesses, mobile money is the fastest and most convenient payment
                      option. You'll receive an USSD code to complete your payment after
                      placing an order.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}