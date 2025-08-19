"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@apollo/client';
import { CREATE_STORE, UPDATE_STORE } from '@/graphql/store.gql';
import Loader from '@/components/seraui/Loader';
import { useToast } from '@/components/toast-provider';

interface StoreFormProps {
  initialData?: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StoreForm({
  initialData,
  onSuccess,
  onCancel
}: StoreFormProps) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const [createStore] = useMutation(CREATE_STORE);
  const [updateStore] = useMutation(UPDATE_STORE);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const storeData = {
        ...formData,
        businessId: 'current-business-id' // In real app, get from useMe()
      };

      if (initialData) {
        await updateStore({
          variables: {
            id: initialData.id,
            input: storeData
          }
        });
        showToast('success', 'Success', 'Store updated successfully');
      } else {
        await createStore({ variables: { input: storeData } });
        showToast('success', 'Success', 'Store created successfully');
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
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Store Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-border rounded-md"
          />
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
          {isSubmitting ? <Loader loading={true} /> : initialData ? 'Update Store' : 'Create Store'}
        </Button>
      </div>
    </form>
  );
}