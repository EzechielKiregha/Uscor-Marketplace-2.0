// app/business/_components/modals/ProductForm.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '@/graphql/product.gql';
import Loader from '@/components/seraui/Loader';
import { useToast } from '@/components/toast-provider';
import { ImageIcon, Trash2, Upload, User } from 'lucide-react';
import { useMe } from '@/lib/useMe';
import Image from 'next/image';
import { put } from '@vercel/blob';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GET_STORES } from '@/graphql/store.gql';
import { ProductEntity, StoreEntity } from '@/lib/types';
import { CREATE_CATEGORY, GET_CATEGORIES } from '@/graphql/category.gql';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function CategoryPopover() {

  const { showToast } = useToast();
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.target as HTMLFormElement;
      const catName = (form.elements.namedItem('catName') as HTMLInputElement)?.value || '';
      const catDesc = (form.elements.namedItem('catDesc') as HTMLInputElement)?.value || '';
      if (!catName.trim()) {
        showToast("error", "Name Required", 'Please enter a category name');
        return;
      }
      await createCategory({
        variables: {
          createCategoryInput: {
            name: catName,
            description: catDesc,
          },
        },
        refetchQueries: [{ query: GET_CATEGORIES }],
      });
      showToast("success", "Success", 'Category created successfully');
    } catch (error: any) {
      showToast("error", "Error", error.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="link" className='underline underline-offset-2 cursor-pointer'>by clicking here</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>create product category</DialogTitle>
          <DialogDescription>
            Create your product category here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="catName">Name</Label>
              <Input id="catName" name="catName" defaultValue="Electronics" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="catDesc">Description</Label>
              <Input id="catDesc" name="catDesc" defaultValue="Electronics products and accessories" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | string>(initialData && initialData.medias[0] ? initialData.medias[0].url : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData ? initialData.title : '',
    description: initialData ? initialData.description : '',
    price: initialData ? initialData.price : '',
    quantity: initialData ? initialData.quantity : '',
    isPhysical: initialData ? initialData.isPhysical : true,
    businessId: user?.id,
    approvedForSale: initialData ? initialData.approvedForSale : true,
    categoryId: initialData ? initialData.categoryId : '',
    featured: initialData ? initialData.featured : false,
    storeId: initialData ? initialData.storeId : '',
  });
  const {
    data: storesData,
    loading: storesLoading,
    error: storesError
  } = useQuery(GET_STORES);
  const {
    data: catData,
    loading: catLoading,
    error: catError
  } = useQuery(GET_CATEGORIES);



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
      setImageFile(e.target.files[0]);
    }
  };

  // Auto-select first store if none selected
  useEffect(() => {
    if (storesData?.stores && storesData.stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(storesData.stores[0].id);
    }
    if (catData?.categories && catData.categories.length > 0 && !selectedCatId) {
      setSelectedCatId(catData.categories[0].id);
    }
  }, [storesData, catData, selectedStoreId, setSelectedCatId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert price and stock to numbers
      const productData = {
        ...formData,
        businessId: user.id,
        isPhysical: formData.isPhysical || true,
        approvedForSale: formData.approvedForSale || true,
        featured: formData.featured || false,
        storeId: selectedStoreId || formData.storeId,
        categoryId: selectedCatId || formData.categoryId,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      // Handle image uploads if any
      if (imageFile) {
        // In a real app, you'd upload images here
        const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
        if (!blobToken && imageFile instanceof File) {
          throw new Error('Vercel Blob token is missing. Please configure NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN.');
        }
        let blob: any = {
          url: '',
          pathname: '',
          size: 0,
          type: 'IMAGE'
        }
        if (imageFile instanceof File) {
          blob = await put(`business/products/medias/${Date.now()}-${imageFile}`, imageFile, {
            access: 'public',
            token: blobToken,
          });
        }

        if (initialData) {
          await updateProduct({
            variables: {
              id: initialData.id,
              input: productData,
              mediaInput: {
                url: blob.url || imageFile,
                pathname: blob.pathname || (imageFile as string).split('.com/')[1],
                type: imageFile instanceof File ? imageFile.type : 'image/jpeg',
                size: imageFile instanceof File ? imageFile.size : 0,
              }
            }
          });
          showToast('success', 'Success', 'Product updated successfully');
        } else {
          await createProduct({
            variables: {
              input: productData,
              mediaInput: {
                url: blob.url,
                pathname: blob.pathname,
                type: imageFile instanceof File ? imageFile.type : 'image/jpeg',
                size: imageFile instanceof File ? imageFile.size : 0,
              }
            }
          });
          showToast('success', 'Success', 'Product created successfully');
        }

        showToast('info', 'Info', 'Uploading product images...');
      } else if (imageFile === '') {
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
            <label htmlFor="quantity" className="block text-sm font-medium mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              className="w-full p-2 border border-border rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <Button variant="link" className='underline underline-offset-2 cursor-pointer' onClick={() => setCreateCategoryOpen(!createCategoryOpen)}>{createCategoryOpen ? "Choose from available categories" : "Create Category"} </Button>
          {!createCategoryOpen && catData && catData.categories.length > 0 && (
            <>
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
                {!catData && !catLoading && <option>No categories found</option>}
                {/* In a real app, you'd fetch categories from the server */}
                {catData && catData.categories.length > 0 && catData.categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </>
          )}
          {createCategoryOpen && catData.categories.length !== 0 && (
            <><p className="text-sm text-muted-foreground mt-1">or create a category for this product</p>
              <CategoryPopover /></>

          )}
          {catData && catData.categories.length === 0 && (
            <>
              <p className="text-sm text-muted-foreground mt-1">No categories available. Please create a category first.</p>
              <CategoryPopover />
            </>
          )}

        </div>
        <div>
          <label htmlFor="storeId" className="block text-sm font-medium mb-1">
            Store
          </label>
          <select
            id="storeId"
            name="storeId"
            value={formData.storeId}
            // onChange={handleChange}
            // className="w-full p-2 border border-border rounded-md"
            required
            title='selected store ID'
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="w-full sm:w-64 p-2 border border-border rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {!storesData && !storesLoading && <option>No stores found</option>}
            {storesData && storesData.stores.map((store: StoreEntity) => (
              <option key={store.id} value={store.id}>
                {store.name} {store.address ? `• ${store.address}` : ''}
              </option>
            ))}
          </select>

        </div>

        <div className="flex items-center">
          <div className="flex flex-row items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="h-4 w-4 text-primary border-border rounded"
            />
            <label htmlFor="featured" className="ml-2 text-sm">
              Featured Product
            </label>
            <input
              type="checkbox"
              id="approvedForSale"
              name="approvedForSale"
              checked={formData.approvedForSale}
              onChange={handleChange}
              className="h-4 w-4 text-primary border-border rounded"
            />
            <label htmlFor="approvedForSale" className="ml-2 text-sm">
              Approve for Sale
            </label>
            <input
              type="checkbox"
              id="isPhysical"
              name="isPhysical"
              checked={formData.isPhysical}
              onChange={handleChange}
              className="h-4 w-4 text-primary border-border rounded"
            />
            <label htmlFor="isPhysical" className="ml-2 text-sm">
              Is Physical Product
            </label>
          </div>

        </div>

        <div>
          <div className="flex items-center gap-4">
            {imageFile ? (
              <div className="relative size-20 rounded-full">
                <Image
                  alt="Logo"
                  src={
                    imageFile instanceof File
                      ? URL.createObjectURL(imageFile)
                      : imageFile
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
              <p className="font-semibold">Product Images</p>
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
            </div>
          </div>
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
          {isSubmitting ? "Submitting..." : initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}