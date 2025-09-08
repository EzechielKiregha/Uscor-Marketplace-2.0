// app/business/_components/modals/ProductForm.tsx
"use client";

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@apollo/client';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '@/graphql/product.gql';
import Loader from '@/components/seraui/Loader';
import { useToast } from '@/components/toast-provider';
import { ImageIcon, Trash2, Upload, User } from 'lucide-react';
import { useMe } from '@/lib/useMe';
import Image from 'next/image';
import { put } from '@vercel/blob';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ProductFormProps {
  initialData?: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({
  initialData,
  onSuccess,
  onCancel
}: ProductFormProps) {
  const user = useMe();

  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    price: '',
    quantity: '',
    isPhysical: true,
    businessId: user?.id,
    approvedForSale: true,
    categoryId: '',
    isFeatured: false,
    image: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert price and stock to numbers
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      // Handle image uploads if any
      if (imageFiles.length === 1) {
        // In a real app, you'd upload images here
        const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
        if (!blobToken && imageFiles[0] instanceof File) {
          throw new Error('Vercel Blob token is missing. Please configure NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN.');
        }
        if (imageFiles[0] instanceof File) {
          const blob = await put(`business/products/medias/${Date.now()}-${imageFiles[0]}`, imageFiles[0], {
            access: 'public',
            token: blobToken,
          });

        }
        showToast('info', 'Info', 'Uploading product images...');
      } else if (imageFiles.length > 1) {
        showToast('warning', 'Warning', 'Please select only one image.');
      } else {
        showToast('info', 'Info', 'No images selected.');
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
            Product Name
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
            rows={2}
            className="w-full p-2 border border-border rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              className="w-full p-2 border border-border rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full p-2 border border-border rounded-md"
            required
          >
            <option value="">Select a category</option>
            {/* In a real app, you'd fetch categories from the server */}
            <option value="1">Electronics</option>
            <option value="2">Clothing</option>
            <option value="3">Home & Kitchen</option>
          </select>
        </div>

        <div className="flex items-center">
          <div className="flex flex-row items-center space-x-2">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="h-4 w-4 text-primary border-border rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 text-sm">
              Featured Product
            </label>
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.approvedForSale}
              onChange={handleChange}
              className="h-4 w-4 text-primary border-border rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 text-sm">
              Approve for Sale
            </label>
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isPhysical}
              onChange={handleChange}
              className="h-4 w-4 text-primary border-border rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 text-sm">
              Is Physical Product
            </label>
          </div>

        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Product Images
          </label>
          <input
            title='file'
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full"
          />
          <div className="flex items-center gap-4">
            {imageFiles.length > 0 ? (
              <div className="relative size-20 rounded-full">
                <Image
                  alt="Logo"
                  src={
                    imageFiles[0] instanceof File
                      ? URL.createObjectURL(imageFiles[0])
                      : imageFiles[0]
                  }
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            ) : (
              <div>
                <Avatar className="size-20">
                  <AvatarFallback>
                    <ImageIcon className="size-10 text-neutral-500" />
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <div>
              <p className="font-semibold">Project Icon</p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG, SVG or JPEG, max 1MB
              </p>
              <input
                title="file"
                // disabled={isPending}
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleImageUpload}
              />
              {imageFiles[0] ? (
                <Button
                  variant={"destructive"}
                  type="button"
                  size={"sm"}
                  className="mt-2"
                  onClick={() => {
                    formData.image.onChange("");
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <Trash2 />
                </Button>
              ) : (
                <Button
                  variant={"outline"}
                  type="button"
                  size={"sm"}
                  className="mt-2"
                  onClick={() => {
                    fileInputRef?.current?.click();
                  }}
                >
                  <Upload />
                </Button>
              )}
            </div>
          </div>
          {imageFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
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
          {isSubmitting ? <Loader loading={true} /> : initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}