// app/business/settings/_components/Preferences.tsx
'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  UPDATE_BUSINESS_PROFILE,
  GET_BUSINESS_TYPES
} from '@/graphql/settings.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Globe,
  Bell,
  Mail,
  Lock,
  CheckCircle,
  Users,
  MessageSquare,
  Building2,
  Palette,
  BookOpen,
  Plug,
  Hammer,
  ShoppingCart,
  Coffee,
  UtensilsCrossed,
  Store,
  Wine,
  Shirt,
  Loader2,
  X
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMe } from '@/lib/useMe';
import { GET_BUSINESS_BY_ID } from '@/graphql/business.gql';

// Business types with icons
export const businessTypes = [
  {
    id: 'ARTISAN',
    label: 'Artisan & Handcrafted Goods',
    icon: Palette,
    description: 'Craftsmen, wood workers, local artisans creating handmade products'
  },
  {
    id: 'BOOKSTORE',
    label: 'Bookstore & Stationery',
    icon: BookOpen,
    description: 'Book sellers, stationery shops, and publishing businesses'
  },
  {
    id: 'ELECTRONICS',
    label: 'Electronics & Gadgets',
    icon: Plug,
    description: 'Electronics retailers, gadget stores, and tech repair services'
  },
  {
    id: 'HARDWARE',
    label: 'Hardware & Tools',
    icon: Hammer,
    description: 'Hardware stores, tool suppliers, and building material retailers'
  },
  {
    id: 'GROCERY',
    label: 'Grocery & Convenience',
    icon: ShoppingCart,
    description: 'Grocery stores, supermarkets, and convenience shops'
  },
  {
    id: 'CAFE',
    label: 'Café & Coffee Shops',
    icon: Coffee,
    description: 'Coffee shops, cafés, and beverage-focused businesses'
  },
  {
    id: 'RESTAURANT',
    label: 'Restaurant & Dining',
    icon: UtensilsCrossed,
    description: 'Full-service restaurants, eateries, and dining establishments'
  },
  {
    id: 'RETAIL',
    label: 'Retail & General Stores',
    icon: Store,
    description: 'General retail stores, department stores, and variety shops'
  },
  {
    id: 'BAR',
    label: 'Bar & Pub',
    icon: Wine,
    description: 'Bars, pubs, and establishments focused on alcoholic beverages'
  },
  {
    id: 'CLOTHING',
    label: 'Clothing & Accessories',
    icon: Shirt,
    description: 'Clothing retailers, fashion boutiques, and accessory stores'
  },
];

// Map business types to contextual benefits & tips
const businessBenefitsMap: Record<string, { title: string; items: string[]; tip?: string }> = {
  ARTISAN: {
    title: 'Benefits for Artisans & Handcrafted Goods',
    items: [
      'Showcase custom work with dedicated service pages',
      'Book consultations and custom orders easily',
      'Manage bespoke requests and timelines per order',
      'Upsell materials or maintenance services to customers'
    ],
    tip: 'Use Uscor to create service templates for recurring custom jobs and track progress per order.'
  },
  BOOKSTORE: {
    title: 'Benefits for Bookstores & Stationery',
    items: [
      'Offer book-binding, gift-wrap and special order services',
      'Schedule author signing or workshop slots',
      'Bundle physical products with service add-ons',
      'Easily set fixed or hourly rates for workshops'
    ],
    tip: 'Promote workshops and pre-orders through service listing to drive foot traffic.'
  },
  ELECTRONICS: {
    title: 'Benefits for Electronics & Gadgets',
    items: [
      'List repair, diagnostics and upgrade services',
      'Track device intake and return dates per order',
      'Define parts and labor pricing separately',
      'Send automated status updates to customers'
    ],
    tip: 'Use Uscor\'s order notes and status updates to build trust around repair timelines.'
  },
  HARDWARE: {
    title: 'Benefits for Hardware & Tools',
    items: [
      'Offer tool rentals, on-site installation, and repair services',
      'Manage inventory-linked service availability',
      'Set hourly or project rates for installations',
      'Coordinate technicians and on-site visits'
    ],
    tip: 'Configure availability windows and worker assignments for smoother scheduling.'
  },
  GROCERY: {
    title: 'Benefits for Grocery & Convenience',
    items: [
      'Provide delivery and grocery-picking services',
      'Create subscription or recurring order services',
      'Add special handling or packaging fees',
      'Handle same-day delivery windows and cutoffs'
    ],
    tip: 'Use service-based pricing to offer premium delivery slots and increase order value.'
  },
  CAFE: {
    title: 'Benefits for Café & Coffee Shops',
    items: [
      'Offer catering, coffee subscription and event services',
      'Take advance orders for pickup and large orders',
      'Manage time-sloted pickups to reduce congestion',
      'Upsell packages for meetings and events'
    ],
    tip: 'Use Uscor to accept advance group orders and manage pickup time windows.'
  },
  RESTAURANT: {
    title: 'Benefits for Restaurant & Dining',
    items: [
      'Accept catering and private dining bookings',
      'Manage booking deposits and pre-orders',
      'Coordinate kitchen prep and staffing per booking',
      'Track special requests and dietary notes'
    ],
    tip: 'Leverage service bookings to smooth kitchen load and capture higher-value orders.'
  },
  RETAIL: {
    title: 'Benefits for Retail & General Stores',
    items: [
      'Offer installation, assembly or personalization services',
      'Sell product+service bundles',
      'Schedule in-store appointments for fittings or demos',
      'Track service warranties and follow-up tasks'
    ],
    tip: 'Combine product SKUs with services to increase average order value.'
  },
  BAR: {
    title: 'Benefits for Bars & Pubs',
    items: [
      'Manage private event bookings and drink packages',
      'Offer on-site bartending or service add-ons',
      'Collect deposits and manage guest lists',
      'Coordinate staff assignments for events'
    ],
    tip: 'Use Uscor to streamline event bookings and staff scheduling for private parties.'
  },
  CLOTHING: {
    title: 'Benefits for Clothing & Accessories',
    items: [
      'Offer alterations, custom tailoring and styling sessions',
      'Schedule fittings and appointment slots',
      'Bundle styling sessions with product purchases',
      'Manage turnaround times and priority jobs'
    ],
    tip: 'Enable appointment-based services to deliver high-touch curated experiences.'
  }
};

interface PreferencesProps {
  // Optional props if needed
}

export default function Preferences({ }: PreferencesProps) {
  const { user, loading: authLoading } = useMe();
  const [formData, setFormData] = useState({
    isB2BEnabled: false,
    receiveNotifications: true,
    receiveEmails: true,
    allowMessaging: true,
    showInMarketplace: true,
    language: 'en',
    timeZone: 'Africa/Kigali',
    businessType: 'ARTISAN'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBusinessTypeModal, setShowBusinessTypeModal] = useState(false);
  const { showToast } = useToast();

  const {
    data: businessTypesData,
    loading: businessTypesLoading
  } = useQuery(GET_BUSINESS_TYPES);
  const { data: businessData } = useQuery(GET_BUSINESS_BY_ID, {
    variables: { id: user?.id },
  })

  const [updateProfile] = useMutation(UPDATE_BUSINESS_PROFILE);

  useEffect(() => {
    if (businessData) {
      setFormData({
        isB2BEnabled: businessData.isB2BEnabled,
        receiveNotifications: true, // In real app, this would come from settings
        receiveEmails: true,
        allowMessaging: true,
        showInMarketplace: true,
        language: 'en',
        timeZone: businessData.country === 'RWANDA' ? 'Africa/Kigali' :
          businessData.country === 'UGANDA' ? 'Africa/Kampala' :
            businessData.country === 'KENYA' ? 'Africa/Nairobi' :
              businessData.country === 'TANZANIA' ? 'Africa/Dar_es_Salaam' :
                businessData.country === 'DRC' ? 'Africa/Kinshasa' :
                  businessData.country === 'BURUNDI' ? 'Africa/Bujumbura' : 'Africa/Kigali',
        businessType: businessData.businessType || 'ARTISAN'
      });
    }
  }, [user]);

  const handleToggle = (name: string) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name as keyof typeof prev] }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile({
        variables: {
          id: user?.id,
          input: {
            isB2BEnabled: formData.isB2BEnabled,
            businessType: formData.businessType
          }
        }
      });

      showToast('success', 'Success', 'Preferences updated successfully');
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to update preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || businessTypesLoading) return (
    <Card>
      <CardContent className="h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </CardContent>
    </Card>
  );

  const benefits = businessBenefitsMap[formData.businessType as keyof typeof businessBenefitsMap] || businessBenefitsMap.ARTISAN;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Preferences
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Customize your business experience
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBusinessTypeModal(true)}>
              Change Business Type
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Marketplace Settings */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Marketplace Settings
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Control how your business appears and operates in the marketplace
                </p>
              </div>
            </div>

            <div className="space-y-4 pl-2 border-l border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable B2B Transactions</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow other businesses to purchase your products and services
                  </p>
                </div>
                <Switch
                  checked={formData.isB2BEnabled}
                  onCheckedChange={() => handleToggle('isB2BEnabled')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Show in Marketplace Directory</h4>
                  <p className="text-sm text-muted-foreground">
                    Make your business visible to other businesses in the marketplace directory
                  </p>
                </div>
                <Switch
                  checked={formData.showInMarketplace}
                  onCheckedChange={() => handleToggle('showInMarketplace')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Allow Messaging from Other Businesses</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable other businesses to send you messages about products and services
                  </p>
                </div>
                <Switch
                  checked={formData.allowMessaging}
                  onCheckedChange={() => handleToggle('allowMessaging')}
                />
              </div>
            </div>
          </div>

          {/* Communication Settings */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Communication Settings
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage how you receive notifications and messages
                </p>
              </div>
            </div>

            <div className="space-y-4 pl-2 border-l border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Receive Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Get instant notifications for new messages and orders
                  </p>
                </div>
                <Switch
                  checked={formData.receiveNotifications}
                  onCheckedChange={() => handleToggle('receiveNotifications')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Receive Marketing Emails</h4>
                  <p className="text-sm text-muted-foreground">
                    Get updates about new features and marketplace opportunities
                  </p>
                </div>
                <Switch
                  checked={formData.receiveEmails}
                  onCheckedChange={() => handleToggle('receiveEmails')}
                />
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Regional Settings
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Set your business location and language preferences
                </p>
              </div>
            </div>

            <div className="space-y-4 pl-2 border-l border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleSelectChange('language', e.target.value)}
                    className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                    <option value="rw">Kinyarwanda</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Time Zone</label>
                  <select
                    value={formData.timeZone}
                    onChange={(e) => handleSelectChange('timeZone', e.target.value)}
                    className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
                  >
                    <option value="Africa/Kigali">Kigali, Rwanda (GMT+2)</option>
                    <option value="Africa/Kampala">Kampala, Uganda (GMT+3)</option>
                    <option value="Africa/Nairobi">Nairobi, Kenya (GMT+3)</option>
                    <option value="Africa/Dar_es_Salaam">Dar es Salaam, Tanzania (GMT+3)</option>
                    <option value="Africa/Kinshasa">Kinshasa, DRC (GMT+1)</option>
                    <option value="Africa/Bujumbura">Bujumbura, Burundi (GMT+2)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select
                    value={businessData?.country === 'RWANDA' ? 'RWF' :
                      businessData?.country === 'UGANDA' ? 'UGX' :
                        businessData?.country === 'KENYA' ? 'KES' :
                          businessData?.country === 'TANZANIA' ? 'TZS' :
                            businessData?.country === 'DRC' ? 'CDF' :
                              businessData?.country === 'BURUNDI' ? 'BIF' : 'RWF'}
                    className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
                    disabled
                  >
                    <option value="RWF">Rwandan Franc (RWF)</option>
                    <option value="UGX">Ugandan Shilling (UGX)</option>
                    <option value="KES">Kenyan Shilling (KES)</option>
                    <option value="TZS">Tanzanian Shilling (TZS)</option>
                    <option value="CDF">Congolese Franc (CDF)</option>
                    <option value="BIF">Burundian Franc (BIF)</option>
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Currency is determined by your business location
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Measurement System</label>
                  <select
                    value="metric"
                    className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
                  >
                    <option value="metric">Metric (kg, m)</option>
                    <option value="imperial">Imperial (lb, ft)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Business Type Benefits */}
          <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4 bg-muted">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              {benefits.title}
            </h3>

            <ul className="space-y-2">
              {benefits.items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {benefits.tip && (
              <div className="mt-4 p-3 bg-background rounded-lg border border-orange-400/60 dark:border-orange-500/70">
                <p className="text-sm">
                  <strong>Pro Tip:</strong> {benefits.tip}
                </p>
              </div>
            )}
          </div>

          {/* East Africa Specific Settings */}
          <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              East Africa Specific Settings
            </h3>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-1">Mobile Money Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Configure how mobile money payments appear to customers:
                </p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Show USSD codes</p>
                      <p className="text-xs text-muted-foreground">
                        Display the full USSD code for customers to dial
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Show QR codes</p>
                      <p className="text-xs text-muted-foreground">
                        Display QR codes for mobile money apps
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Auto-verify payments</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically verify mobile money payments
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-1">Local Market Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Configure settings specific to East African markets:
                </p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Use local product categories</p>
                      <p className="text-xs text-muted-foreground">
                        Show categories common in East African markets
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Show local holidays</p>
                      <p className="text-xs text-muted-foreground">
                        Display East African holidays in your calendar
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset form
                setFormData({
                  isB2BEnabled: businessData?.isB2BEnabled || false,
                  receiveNotifications: true,
                  receiveEmails: true,
                  allowMessaging: true,
                  showInMarketplace: true,
                  language: 'en',
                  timeZone: businessData?.country === 'RWANDA' ? 'Africa/Kigali' :
                    businessData?.country === 'UGANDA' ? 'Africa/Kampala' :
                      businessData?.country === 'KENYA' ? 'Africa/Nairobi' :
                        businessData?.country === 'TANZANIA' ? 'Africa/Dar_es_Salaam' :
                          businessData?.country === 'DRC' ? 'Africa/Kinshasa' :
                            businessData?.country === 'BURUNDI' ? 'Africa/Bujumbura' : 'Africa/Kigali',
                  businessType: businessData?.businessType || 'ARTISAN'
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
              ) : 'Save Preferences'}
            </Button>
          </div>
        </form>

        {/* Business Type Modal */}
        {showBusinessTypeModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Select Business Type</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose the type that best describes your business
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowBusinessTypeModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                  {businessTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.businessType === type.id;

                    return (
                      <div
                        key={type.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                          }`}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, businessType: type.id }));
                          setShowBusinessTypeModal(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <div className={`p-2 rounded-full ${isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                              }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium">{type.label}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Why is business type important?</strong> Your business type determines
                    the features and recommendations you see in the app. It helps us provide
                    relevant tips and optimize your experience for your specific business needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}