"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@apollo/client';
import { CREATE_FREELANCE_SERVICE, UPDATE_FREELANCE_SERVICE } from '@/graphql/freelance.gql';
import Loader from '@/components/seraui/Loader';
import { useToast } from '@/components/toast-provider';

interface ServiceFormProps {
  initialData?: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ServiceForm({
  initialData,
  onSuccess,
  onCancel
}: ServiceFormProps) {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    isHourly: true,
    rate: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const [createService] = useMutation(CREATE_FREELANCE_SERVICE);
  const [updateService] = useMutation(UPDATE_FREELANCE_SERVICE);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert rate to number
      const serviceData = {
        ...formData,
        rate: parseFloat(formData.rate)
      };

      if (initialData) {
        await updateService({
          variables: {
            id: initialData.id,
            input: serviceData
          }
        });
        showToast('success', 'Success', 'Service updated successfully');
      } else {
        await createService({ variables: { input: serviceData } });
        showToast('success', 'Success', 'Service created successfully');
      }

      onSuccess();
    } catch (error: any) {
      showToast('error', 'Error', error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Service Name
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border border-border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border border-border rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rate" className="block text-sm font-medium mb-1">
              Rate ($)
            </label>
            <input
              type="number"
              id="rate"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded-md"
              required
            >
              <option value="">Select a category</option>
              {/* In a real app, you'd fetch categories
              PLUMBER = 'PLUMBER',
              ELECTRICIAN = 'ELECTRICIAN',
              CARPENTER = 'CARPENTER',
              MECHANIC = 'MECHANIC',
              TUTOR = 'TUTOR',
              CLEANER = 'CLEANER',
              OTHER = 'OTHER',
               */}
              <option value="PLUMBER">Plumber Gig/Job</option>
              <option value="ELECTRICIAN">Electrician Gig/Job</option>
              <option value="CARPENTER">Carpenter Gig/Job</option>
              <option value="MECHANIC">Mecanic Gig/Job</option>
              <option value="TUTOR">Tutoring Gig/Job</option>
              <option value="CLEANER">Cleaning Gig/Job</option>
              <option value="OTHER">Other Gig/Job</option>
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isHourly"
            name="isHourly"
            checked={formData.isHourly}
            onChange={handleChange}
            className="h-4 w-4 text-primary border-border rounded"
          />
          <label htmlFor="isHourly" className="ml-2 text-sm">
            Hourly Rate (uncheck for fixed price)
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary hover:bg-accent text-primary-foreground"
          disabled={isSubmitting}
        >
          {isSubmitting ? <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          </div> : initialData ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
}