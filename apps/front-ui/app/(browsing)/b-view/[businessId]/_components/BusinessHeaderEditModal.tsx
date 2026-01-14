// app/business/[id]/_components/BusinessHeaderEditModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import { useMutation, useQuery } from '@apollo/client';
import {
  UPDATE_BUSINESS_PROFILE,
} from '@/graphql/settings.gql';
import { useToast } from '@/components/toast-provider';
import { put } from '@vercel/blob';
import { useMe } from '@/lib/useMe';
import { GET_BUSINESS_BY_ID } from '@/graphql/business-page.gql';

interface BusinessHeaderEditModalProps {
  business: any;
  onClose: () => void;
}

export default function BusinessHeaderEditModal({
  business,
  onClose
}: BusinessHeaderEditModalProps) {
  const { user } = useMe();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: business.name,
    description: business.description || '',
    address: business.address || '',
    phone: business.phone || ''
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(business.coverImage);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(business.avatar);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateProfile] = useMutation(UPDATE_BUSINESS_PROFILE);
  const { refetch } = useQuery(GET_BUSINESS_BY_ID, {
    variables: { id: business.id },
    skip: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'coverImage') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('error', 'Invalid File Type', 'Please upload JPG, PNG, or WebP images only');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File Too Large', 'Please upload images smaller than 5MB');
        return;
      }

      if (type === 'avatar') {
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
      } else {
        setCoverImageFile(file);
        setCoverImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleRemoveImage = (type: 'avatar' | 'coverImage') => {
    if (type === 'avatar') {
      setAvatarFile(null);
      setAvatarPreview(null);
    } else {
      setCoverImageFile(null);
      setCoverImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare image uploads
      let coverImageUrl = business.coverImage;
      let avatarUrl = business.avatar;

      // Handle cover image upload
      if (coverImageFile) {
        const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
        if (!blobToken) {
          throw new Error('Vercel Blob token is missing. Please configure NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN.');
        }

        const blob = await put(`business/${business.id}/cover/${Date.now()}-${coverImageFile.name}`, coverImageFile, {
          access: 'public',
          token: blobToken,
        });

        coverImageUrl = blob.url;
      }

      // Handle avatar upload
      if (avatarFile) {
        const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
        if (!blobToken) {
          throw new Error('Vercel Blob token is missing. Please configure NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN.');
        }

        const blob = await put(`business/${business.id}/avatar/${Date.now()}-${avatarFile.name}`, avatarFile, {
          access: 'public',
          token: blobToken,
        });

        avatarUrl = blob.url;
      }

      // Update business profile
      await updateProfile({
        variables: {
          id: business.id,
          input: {
            name: formData.name,
            description: formData.description,
            address: formData.address,
            phone: formData.phone,
            coverImage: coverImageUrl,
            avatar: avatarUrl
          }
        }
      });

      // Refetch business data
      await refetch();

      showToast('success', 'Success', 'Business profile updated successfully');
      onClose();
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to update business profile');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">Edit Business Profile</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Update your business information and appearance
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Image */}
            <div>
              <h3 className="font-semibold mb-2">Cover Image</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This image appears at the top of your business page
              </p>

              <div className="relative h-48 rounded-lg overflow-hidden border border-orange-400/60 dark:border-orange-500/70">
                {coverImagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('coverImage')}
                      className="absolute top-2 right-2 bg-destructive/10 text-destructive p-1.5 rounded-full hover:bg-destructive/20"
                      aria-label="Remove cover image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center bg-muted cursor-pointer hover:bg-muted/80 transition-colors">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">Click to upload cover image</span>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WebP (max 5MB)</p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={(e) => handleFileChange(e, 'coverImage')}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Avatar */}
            <div>
              <h3 className="font-semibold mb-2">Business Logo</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This is your business profile picture
              </p>

              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border border-orange-400/60 dark:border-orange-500/70">
                  {avatarPreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('avatar')}
                        className="absolute -top-2 -right-2 bg-destructive/10 text-destructive p-1.5 rounded-full hover:bg-destructive/20"
                        aria-label="Remove avatar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center bg-muted cursor-pointer hover:bg-muted/80 transition-colors">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={(e) => handleFileChange(e, 'avatar')}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Square image recommended (200x200px)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, or WebP (max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Business Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
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
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
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

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Business Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
                  placeholder="Tell customers about your business, what you offer, and why they should choose you..."
                ></textarea>
                <p className="mt-1 text-xs text-muted-foreground">
                  This description appears on your business page
                </p>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">
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
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
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
                ) : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}