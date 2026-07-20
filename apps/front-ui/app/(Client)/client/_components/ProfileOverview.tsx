// app/client/_components/ProfileOverview.tsx
"use client";

import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    GET_CLIENT_PROFILE,
    UPDATE_CLIENT_PROFILE,
} from "@/graphql/client-panel.gql";
import { useMe } from "@/lib/useMe";
import { useMutation, useQuery } from "@apollo/client";
import { put } from "@vercel/blob";
import {
    Award,
    Calendar,
    Camera,
    DollarSign,
    Loader2,
    Mail,
    Phone,
    ShoppingBag,
    User,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ProfileOverviewProps {
  client: any;
}

export default function ProfileOverview({ client }: ProfileOverviewProps) {
  const { user } = useMe();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateProfile] = useMutation(UPDATE_CLIENT_PROFILE);
  const { refetch } = useQuery(GET_CLIENT_PROFILE, {
    variables: { id: client.id },
    skip: true,
  });

  useEffect(() => {
    setFormData({
      fullName: client.fullName,
      email: client.email,
      phone: client.phone || "",
      avatar: client.avatar || "",
    });
  }, [client]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        showToast(
          "error",
          "Invalid File Type",
          "Please upload JPG, PNG, or WebP images only",
        );
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showToast(
          "error",
          "File Too Large",
          "Please upload images smaller than 5MB",
        );
        return;
      }

      setAvatarFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setFormData((prev) => ({ ...prev, avatar: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let avatarUrl = client?.avatar || "";

      if (avatarFile) {
        const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
        if (!blobToken && avatarFile instanceof File) {
          throw new Error(
            "Vercel Blob token is missing. Please configure NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN.",
          );
        }

        if (avatarFile instanceof File) {
          const blob = await put(
            `business/medias/${Date.now()}-${avatarFile.name}`,
            avatarFile,
            {
              access: "public",
              token: blobToken,
            },
          );
          avatarUrl = blob.url;
        }
      }

      await updateProfile({
        variables: {
          input: {
            id: client.id,
            fullName: formData.fullName,
            phone: formData.phone,
            avatar: avatarUrl,
          },
        },
      });

      await refetch();
      setIsEditing(false);
      showToast("success", "Success", "Profile updated successfully");
    } catch (error: any) {
      showToast("error", "Error", error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = Math.min((client.loyaltyPoints / 500) * 100, 100);

  return (
    <div className="bg-card border border-orange-400/40 dark:border-orange-500/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Profile Header */}
      <div className="p-6 bg-linear-to-r from-muted/80 via-muted/40 to-transparent border-b border-border/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isEditing ? "Edit Profile" : "Profile Overview"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage your personal information and preferences
            </p>
          </div>

          {!isEditing && (
            <Button
              variant="default"
              onClick={() => setIsEditing(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column: Avatar & Loyalty */}
            <div className="lg:col-span-1 space-y-6">
              {/* Avatar Section */}
              <div className="text-center">
                <div className="relative inline-block group">
                  {isEditing ? (
                    <div className="relative">
                      {formData.avatar ? (
                        <div className="relative">
                          <img
                            src={formData.avatar}
                            alt="Profile preview"
                            className="w-28 h-28 rounded-full object-cover mx-auto ring-4 ring-orange-500/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center mx-auto ring-4 ring-orange-500/10">
                          <User className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}

                      <label className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-2 cursor-pointer hover:bg-orange-600 shadow-lg transition-all duration-200 hover:scale-110">
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
                    <div className="relative inline-block group">
                      {client.avatar ? (
                        <img
                          src={client.avatar}
                          alt={client.fullName}
                          className="w-28 h-28 rounded-full object-cover mx-auto ring-4 ring-orange-500/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center mx-auto ring-4 ring-orange-500/10">
                          <User className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-lg mt-4 text-foreground">
                  {client.fullName}
                </h3>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>

              {/* Loyalty Status */}
              <div className="p-5 bg-linear-to-br from-orange-500/10 via-transparent to-transparent border border-orange-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-orange-500" />
                    <p className="text-sm font-semibold text-foreground">
                      Loyalty Status
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full">
                    {client.loyaltyTier || "Standard"}
                  </span>
                </div>

                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-foreground">
                    {client.loyaltyPoints}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Points</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2 font-medium">
                    <span>Progress</span>
                    <span>{client.loyaltyPoints} / 500</span>
                  </div>
                  <div className="w-full bg-background/50 border border-border/50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-orange-400 to-orange-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="lg:col-span-3 space-y-6">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label
                        htmlFor="fullName"
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-orange-500" /> Full Name
                      </label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="bg-background border-border/60 focus-visible:ring-orange-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4 text-orange-500" /> Email
                        Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-muted/50 border-border/40 text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4 text-orange-500" /> Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+250 788 123 456"
                      className="bg-background border-border/60 focus-visible:ring-orange-500/50"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border/50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          fullName: client.fullName,
                          email: client.email,
                          phone: client.phone || "",
                          avatar: client.avatar || "",
                        });
                        setAvatarFile(null);
                      }}
                      disabled={isSubmitting}
                      className="border-border/60 hover:bg-muted"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all duration-200"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 border border-border/50 rounded-xl hover:border-orange-500/40 hover:bg-muted/50 transition-all duration-200">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        <User className="h-3 w-3" /> Full Name
                      </div>
                      <p className="text-base font-semibold text-foreground">
                        {client.fullName}
                      </p>
                    </div>

                    <div className="p-4 bg-muted/30 border border-border/50 rounded-xl hover:border-orange-500/40 hover:bg-muted/50 transition-all duration-200">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        <Mail className="h-3 w-3" /> Email Address
                      </div>
                      <p className="text-base font-semibold text-foreground break-all">
                        {client.email}
                      </p>
                    </div>

                    <div className="p-4 bg-muted/30 border border-border/50 rounded-xl hover:border-orange-500/40 hover:bg-muted/50 transition-all duration-200">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        <Phone className="h-3 w-3" /> Phone Number
                      </div>
                      <p className="text-base font-semibold text-foreground">
                        {client.phone || (
                          <span className="italic text-muted-foreground/70 font-normal">
                            Not provided
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="p-4 bg-muted/30 border border-border/50 rounded-xl hover:border-orange-500/40 hover:bg-muted/50 transition-all duration-200">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        <Calendar className="h-3 w-3" /> Member Since
                      </div>
                      <p className="text-base font-semibold text-foreground">
                        {new Date(client.createdAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" },
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-5 bg-linear-to-br from-orange-500/5 to-transparent border border-orange-500/20 rounded-xl flex items-center gap-4">
                      <div className="p-3 bg-orange-500/10 rounded-lg">
                        <ShoppingBag className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Total Orders
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {client.totalOrders}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 bg-linear-to-br from-orange-500/5 to-transparent border border-orange-500/20 rounded-xl flex items-center gap-4">
                      <div className="p-3 bg-orange-500/10 rounded-lg">
                        <DollarSign className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Total Spent
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          ${client.totalSpent.toFixed(2)}
                        </p>
                      </div>
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
