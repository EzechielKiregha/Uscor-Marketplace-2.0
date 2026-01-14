// app/client/_components/ProfileOverview.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Loader2,
  Camera,
  X
} from 'lucide-react';
import { useMutation, useQuery } from '@apollo/client';
import {
  UPDATE_CLIENT_PROFILE,
  GET_CLIENT_PROFILE
} from '@/graphql/client-panel.gql';
import { useToast } from '@/components/toast-provider';
import { useMe } from '@/lib/useMe';

interface ProfileOverviewProps {
  client: any;
}

export default function ProfileOverview({ client }: ProfileOverviewProps) {
  const { user } = useMe();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateProfile] = useMutation(UPDATE_CLIENT_PROFILE);
  const { refetch } = useQuery(GET_CLIENT_PROFILE, {
    variables: { id: client.id },
    skip: true
  });

  useEffect(() => {
    setFormData({
      fullName: client.fullName,
      email: client.email,
      phone: client.phone || '',
      avatar: client.avatar || ''
    });
  }, [client]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setAvatarFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setFormData(prev => ({ ...prev, avatar: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, we'd upload the avatar file first
      // For now, we'll just use the preview URL

      await updateProfile({
        variables: {
          id: client.id,
          input: {
            fullName: formData.fullName,
            phone: formData.phone
          }
        }
      });

      // Refetch to get updated data
      await refetch();

      setIsEditing(false);
      showToast('success', 'Success', 'Profile updated successfully');
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
      {/* Profile Header */}
      <div className="p-6 bg-muted border-b border-border">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">{isEditing ? 'Edit Profile' : 'Profile Overview'}</h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal information and preferences
            </p>
          </div>

          {!isEditing && (
            <Button
              variant="default"
              onClick={() => setIsEditing(true)}
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Avatar Section */}
            <div className="lg:col-span-1 space-y-4">
              <div className="text-center">
                {isEditing ? (
                  <div className="relative inline-block">
                    {formData.avatar ? (
                      <div className="relative">
                        <img
                          src={formData.avatar}
                          alt="Profile preview"
                          className="w-24 h-24 rounded-full object-cover mx-auto"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="absolute -top-2 -right-2 bg-destructive/10 text-destructive p-1 rounded-full hover:bg-destructive/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-accent">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    {client.avatar ? (
                      <img
                        src={client.avatar}
                        alt={client.fullName}
                        className="w-24 h-24 rounded-full object-cover mx-auto"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                )}

                <h3 className="font-medium mt-3">{client.fullName}</h3>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>

              {/* Loyalty Status */}
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Loyalty Status</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {client.loyaltyTier || 'Standard'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{client.loyaltyPoints}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{client.loyaltyPoints} / 500</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${Math.min(client.loyaltyPoints / 5, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-3 space-y-6">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium mb-1 flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Full Name
                      </label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
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
                        value={formData.email}
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
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+250 788 123 456"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          fullName: client.fullName,
                          email: client.email,
                          phone: client.phone || '',
                          avatar: client.avatar || ''
                        });
                        setAvatarFile(null);
                      }}
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
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      <p className="font-medium">{client.fullName}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address</label>
                      <p className="font-medium">{client.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <p className="font-medium">{client.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Member Since</label>
                    <p className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Orders</label>
                      <p className="font-medium">{client.totalOrders}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Total Spent</label>
                      <p className="font-medium">${client.totalSpent.toFixed(2)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}