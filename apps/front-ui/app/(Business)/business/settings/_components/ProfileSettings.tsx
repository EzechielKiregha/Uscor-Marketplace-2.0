'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_BUSINESS_PROFILE } from '@/graphql/settings.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User,
  Mail,
  MapPin,
  Phone,
  Image,
  Camera,
  CheckCircle,
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
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMe } from '@/lib/useMe';
import { GET_BUSINESS_BY_ID } from '@/graphql/business.gql';
import Loader from '@/components/seraui/Loader';
import { Textarea } from '@/components/ui/textarea';
import { put } from '@vercel/blob';

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

interface ProfileSettingsProps {
  // Optional props if needed
}

export default function ProfileSettings({ }: ProfileSettingsProps) {
  const { user, loading: authLoading } = useMe();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    address: '',
    phone: '',
    country: '',
    businessType: '',
    avatar: '',
    coverImage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const [updateProfile] = useMutation(UPDATE_BUSINESS_PROFILE);
  const { data: businessData, refetch: refetchBusiness } = useQuery(GET_BUSINESS_BY_ID, {
    variables: { id: user?.id },
    skip: !user
  })
  const { showToast } = useToast();

  useEffect(() => {
    if (businessData) {
      setFormData({
        name: businessData.business.name,
        email: businessData.business.email,
        description: businessData.business.description || '',
        address: businessData.business.address || '',
        phone: businessData.business.phone || '',
        country: businessData.business.country || 'RWANDA',
        businessType: businessData.business.businessType || '',
        avatar: businessData.business.avatar || '',
        coverImage: businessData.business.coverImage || ''
      });
    }
  }, [businessData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'coverImage') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (type === 'avatar') {
        setAvatarFile(file);
      } else {
        setCoverImageFile(file);
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [type]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {

      // Handle image uploads if any
      let blob_avatar: any = {
        url: '',
        pathname: '',
        size: 0,
        type: 'IMAGE'
      }
      let blob_coverImage: any = {
        url: '',
        pathname: '',
        size: 0,
        type: 'IMAGE'
      }
      const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
      if (avatarFile) {
        if (!blobToken && avatarFile instanceof File) {
          throw new Error('Vercel Blob token is missing. Please configure NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN.');
        }
        if (avatarFile instanceof File) {
          blob_avatar = await put(`business/medias/${Date.now()}-${avatarFile}`, avatarFile, {
            access: 'public',
            token: blobToken,
          });
        }
      }
      if (coverImageFile) {
        if (!blobToken && coverImageFile instanceof File) {
          throw new Error('Vercel Blob token is missing. Please configure NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN.');
        }
        if (coverImageFile instanceof File) {
          blob_coverImage = await put(`business/medias/${Date.now()}-${coverImageFile}`, coverImageFile, {
            access: 'public',
            token: blobToken,
          });
        }
      }

      await updateProfile({
        variables: {
          id: user?.id,
          input: {
            name: formData.name,
            email: formData.email,
            description: formData.description,
            address: formData.address,
            phone: formData.phone,
            country: formData.country,
            businessType: formData.businessType,
            avatar: avatarFile instanceof File ? blob_avatar.url : businessData.business.avatar,
            coverImage: coverImageFile instanceof File ? blob_coverImage.url : businessData.business.coverImage
          }
        }
      });

      showToast('success', 'Success', 'Profile updated successfully');
    } catch (error) {
      showToast('error', 'Error', 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return (
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
              <User className="h-5 w-5" />
              Business Profile
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your business information and appearance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Preview</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Type Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Business Type</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Select your business type to customize your experience
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${formData.businessType === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => setFormData(prev => ({ ...prev, businessType: type.id }))}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className={`p-2 rounded-full ${formData.businessType === type.id
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
            </div>
          </div>

          {/* Profile Images */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Profile Images</h3>
              <p className="text-sm text-muted-foreground mb-3">
                These images will be visible to customers and other businesses
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Business Logo</label>
                  <div className="relative w-24 h-24">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Business logo"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-accent">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'avatar')}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Square image recommended (200x200px)
                  </p>
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Cover Image</label>
                  <div className="relative w-full h-24">
                    {formData.coverImage ? (
                      <img
                        src={formData.coverImage}
                        alt="Cover image"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <label className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-accent">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'coverImage')}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Wide image recommended (1200x400px)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Business Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className=" text-sm font-medium mb-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Business Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your business name"
                />
              </div>

              <div>
                <label htmlFor="email" className=" text-sm font-medium mb-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Business Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@yourbusiness.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Business Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell customers about your business, what you offer, and why they should choose you..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="address" className=" text-sm font-medium mb-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Business Address
                </label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street, City, Country"
                />
              </div>

              <div>
                <label htmlFor="phone" className=" text-sm font-medium mb-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+250 788 123 456"
                />
              </div>
            </div>

            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleSelectChange}
              className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
            >
              <option value="RWANDA">Rwanda</option>
              <option value="UGANDA">Uganda</option>
              <option value="KENYA">Kenya</option>
              <option value="TANZANIA">Tanzania</option>
              <option value="DRC">Democratic Republic of Congo</option>
              <option value="BURUNDI">Burundi</option>
            </select>
            <p className="mt-1 text-sm text-muted-foreground">
              Your business location determines payment methods and regulations
            </p>
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

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset form
                setFormData({
                  name: businessData?.business.name || '',
                  email: businessData?.business.email || '',
                  description: businessData?.business.description || '',
                  address: businessData?.business.address || '',
                  phone: businessData?.business.phone || '',
                  country: businessData?.business.country || 'RWANDA',
                  businessType: businessData?.business.businessType || 'ARTISAN',
                  avatar: businessData?.business.avatar || '',
                  coverImage: businessData?.business.coverImage || ''
                });
                setAvatarFile(null);
                setCoverImageFile(null);
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
      </CardContent>
    </Card>
  );
}