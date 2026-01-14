// app/business/freelance-services/_components/ServiceManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import {
  UPDATE_FREELANCE_SERVICE,
  DELETE_FREELANCE_SERVICE
} from '@/graphql/freelance.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BriefcaseBusiness,
  Coins,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BusinessEntity, FreelanceServiceEntity } from '@/lib/types';
import { useMe } from '@/lib/useMe';

interface ServiceManagementProps {
  service: FreelanceServiceEntity; // Replace with FreelanceServiceEntity
  loading: boolean;
}

export default function ServiceManagement({
  service,
  loading
}: ServiceManagementProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isHourly: true,
    rate: '',
    category: ''
  });
  const [validationErrors, setValidationErrors] = useState<any>({});
  const { showToast } = useToast();
  const { user } = useMe();

  const [updateService] = useMutation(UPDATE_FREELANCE_SERVICE);
  const [deleteService] = useMutation(DELETE_FREELANCE_SERVICE);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        description: service.description || 'No Description',
        isHourly: service.isHourly,
        rate: service.rate.toString(),
        category: service.category
      });
    }

    console.log('Service data loaded: ', service);

  }, [service]);

  const validateForm = () => {
    const errors: any = {};

    if (!formData.title.trim()) {
      errors.title = 'Service name is required';
    }

    if (formData.rate === '' || parseFloat(formData.rate) <= 0) {
      errors.rate = 'Rate must be greater than 0';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please fix the errors in the form');
      return;
    }

    try {
      await updateService({
        variables: {
          id: service.id,
          input: {
            title: formData.title,
            description: formData.description,
            isHourly: formData.isHourly,
            rate: parseFloat(formData.rate),
            category: formData.category
          }
        }
      });
      showToast('success', 'Success', 'Service updated successfully');
    } catch (error) {
      showToast('error', 'Error', 'Failed to update service');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this service? This will also delete all associated orders.')) {
      try {
        await deleteService({
          variables: { id: service.id }
        });
        showToast('success', 'Success', 'Service deleted successfully');
        // In a real app, we'd navigate to the services list
      } catch (error) {
        showToast('error', 'Error', 'Failed to delete service');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Map business types to contextual benefits & tips
  const businessBenefitsMap: Record<string, { title: string; items: string[]; tip?: string }> = {
    artisan: {
      title: 'Benefits for Artisans & Handcrafted Goods',
      items: [
        'Showcase custom work with dedicated service pages',
        'Book consultations and custom orders easily',
        'Manage bespoke requests and timelines per order',
        'Upsell materials or maintenance services to customers'
      ],
      tip: 'Use Uscor to create service templates for recurring custom jobs and track progress per order.'
    },
    bookstore: {
      title: 'Benefits for Bookstores & Stationery',
      items: [
        'Offer book-binding, gift-wrap and special order services',
        'Schedule author signing or workshop slots',
        'Bundle physical products with service add-ons',
        'Easily set fixed or hourly rates for workshops'
      ],
      tip: 'Promote workshops and pre-orders through service listing to drive foot traffic.'
    },
    electronics: {
      title: 'Benefits for Electronics & Gadgets',
      items: [
        'List repair, diagnostics and upgrade services',
        'Track device intake and return dates per order',
        'Define parts and labor pricing separately',
        'Send automated status updates to customers'
      ],
      tip: 'Use Uscor’s order notes and status updates to build trust around repair timelines.'
    },
    hardware: {
      title: 'Benefits for Hardware & Tools',
      items: [
        'Offer tool rentals, on-site installation, and repair services',
        'Manage inventory-linked service availability',
        'Set hourly or project rates for installations',
        'Coordinate technicians and on-site visits'
      ],
      tip: 'Configure availability windows and worker assignments for smoother scheduling.'
    },
    grocery: {
      title: 'Benefits for Grocery & Convenience',
      items: [
        'Provide delivery and grocery-picking services',
        'Create subscription or recurring order services',
        'Add special handling or packaging fees',
        'Handle same-day delivery windows and cutoffs'
      ],
      tip: 'Use service-based pricing to offer premium delivery slots and increase order value.'
    },
    cafe: {
      title: 'Benefits for Café & Coffee Shops',
      items: [
        'Offer catering, coffee subscription and event services',
        'Take advance orders for pickup and large orders',
        'Manage time-sloted pickups to reduce congestion',
        'Upsell packages for meetings and events'
      ],
      tip: 'Use Uscor to accept advance group orders and manage pickup time windows.'
    },
    restaurant: {
      title: 'Benefits for Restaurant & Dining',
      items: [
        'Accept catering and private dining bookings',
        'Manage booking deposits and pre-orders',
        'Coordinate kitchen prep and staffing per booking',
        'Track special requests and dietary notes'
      ],
      tip: 'Leverage service bookings to smooth kitchen load and capture higher-value orders.'
    },
    retail: {
      title: 'Benefits for Retail & General Stores',
      items: [
        'Offer installation, assembly or personalization services',
        'Sell product+service bundles',
        'Schedule in-store appointments for fittings or demos',
        'Track service warranties and follow-up tasks'
      ],
      tip: 'Combine product SKUs with services to increase average order value.'
    },
    bar: {
      title: 'Benefits for Bars & Pubs',
      items: [
        'Manage private event bookings and drink packages',
        'Offer on-site bartending or service add-ons',
        'Collect deposits and manage guest lists',
        'Coordinate staff assignments for events'
      ],
      tip: 'Use Uscor to streamline event bookings and staff scheduling for private parties.'
    },
    clothing: {
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

  const rawType = ((user as BusinessEntity)?.businessType || '').toString().toLowerCase();
  const typeKey = Object.keys(businessBenefitsMap).includes(rawType) ? rawType : 'artisan';
  const benefits = businessBenefitsMap[typeKey];

  if (loading) return (
    <Card>
      <CardContent className="h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </CardContent>
    </Card>
  );

  if (!service) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Service Management
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage details for {service.title}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Preview</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Service
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Service Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="pl-9"
                    placeholder="e.g., Custom Woodworking"
                  />
                </div>
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Service Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your service in detail..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="rate" className="block text-sm font-medium mb-1">
                  Service Rate
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="rate"
                    name="rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rate}
                    onChange={handleInputChange}
                    className="pl-9"
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formData.isHourly ? 'Rate per hour' : 'Fixed rate for the service'}
                </p>
                {validationErrors.rate && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.rate}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
                >
                  <option value="">Select a category</option>
                  <option value="WOODWORKING">Woodworking</option>
                  <option value="METALWORKING">Metalworking</option>
                  <option value="REPAIR">Repair Services</option>
                  <option value="CUSTOM_MAKING">Custom Making</option>
                  <option value="INSTALLATION">Installation</option>
                </select>
                <p className="mt-1 text-sm text-muted-foreground">
                  Helps customers find your service
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isHourly"
                  name="isHourly"
                  checked={formData.isHourly}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary border-border rounded"
                />
                <label htmlFor="isHourly" className="ml-2 text-sm">
                  Hourly Rate (uncheck for fixed price)
                </label>
              </div>
            </div>
          </div>

          {/* Service Preview */}
          <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4 bg-muted">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4 text-primary" />
              Service Preview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-background rounded-lg border border-orange-400/60 dark:border-orange-500/70">
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-medium mt-1 truncate">{formData.title || 'Service Name'}</p>
              </div>

              <div className="p-3 bg-background rounded-lg border border-orange-400/60 dark:border-orange-500/70">
                <p className="text-sm text-muted-foreground">Rate</p>
                <p className="font-medium mt-1">
                  ${formData.rate || '0.00'} {formData.isHourly ? '/hr' : 'fixed'}
                </p>
              </div>

              <div className="p-3 bg-background rounded-lg border border-orange-400/60 dark:border-orange-500/70">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium mt-1 capitalize">
                  {formData.category || 'Uncategorized'}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-background rounded-lg border border-orange-400/60 dark:border-orange-500/70">
              <p className="font-medium">Description:</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {formData.description || 'Service description goes here...'}
              </p>
            </div>
          </div>

          {/* Contextual Benefits based on business type */}
          <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              {benefits.title}
            </h3>

            <ul className="space-y-2">
              {benefits.items.map((it, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>

            {benefits.tip && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Pro Tip:</strong> {benefits.tip} Uscor makes these services easy to customize, assign staff, set availability, and track orders so you can focus on delivering great experiences.
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
                  title: service.title,
                  description: service.description || 'No Description',
                  isHourly: service.isHourly,
                  rate: service.rate.toString(),
                  category: service.category
                });
                setValidationErrors({});
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-accent text-primary-foreground"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}