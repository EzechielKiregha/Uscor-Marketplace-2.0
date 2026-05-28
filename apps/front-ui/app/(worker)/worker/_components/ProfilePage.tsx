"use client";

import { useMutation, useQuery } from "@apollo/client";
import { put } from "@vercel/blob";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  Camera,
  Clock,
  Loader2,
  Mail,
  Phone,
  Settings,
  ShieldCheck,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "@/components/seraui/Loader";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GET_WORKER_PROFILE,
  GET_WORKER_SHIFTS,
  UPDATE_WORKER_PROFILE,
} from "@/graphql/worker.gql";
import { useMe } from "@/lib/useMe";

type ProfilePageProps = {
  viewMode?: "worker" | "business"; // New prop
  workerId?: string;
};

export default function ProfilePage({
  viewMode = "worker",
  workerId,
}: ProfilePageProps) {
  const { user } = useMe();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const effectiveWorkerId =
    viewMode === "business" && workerId ? workerId : user?.id;
  const {
    data: workerData,
    loading: workerLoading,
    error: workerError,
    refetch: refetchWorker,
  } = useQuery(GET_WORKER_PROFILE, {
    variables: { id: effectiveWorkerId },
    skip: !effectiveWorkerId,
  });

  const { data: shiftsData, loading: shiftsLoading } = useQuery(
    GET_WORKER_SHIFTS,
    {
      variables: {
        workerId: effectiveWorkerId,
        limit: 10,
      },
      skip: !effectiveWorkerId,
    },
  );

  const [updateProfile] = useMutation(UPDATE_WORKER_PROFILE);

  const worker = workerData?.worker;
  const recentShifts = shiftsData?.workerShifts?.items || [];

  useEffect(() => {
    if (worker) {
      setFormData({
        fullName: worker.fullName || "",
        email: worker.email || "",
        phone: worker.phone || "",
        role: worker.role || "",
        bio: worker.bio || "",
      });
      setAvatarPreview(worker.avatar || null);
    }
  }, [worker]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setFormData((prev) => ({ ...prev, avatar: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Handle avatar upload if needed
      let avatarUrl = worker?.avatar || "";
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
          id: effectiveWorkerId,
          updateWorkerInput: {
            id: effectiveWorkerId,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            bio: formData.bio,
            avatar: avatarUrl,
          },
        },
      });

      showToast("success", "Success", "Profile updated successfully");
      setIsEditing(false);
      refetchWorker();
    } catch (error: any) {
      showToast("error", "Error", error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (workerLoading || shiftsLoading) return <Loader loading={true} />;
  if (workerError)
    return <div>Error loading profile: {workerError.message}</div>;

  const totalSales = worker?.sales?.reduce(
    (sum: any, sale: any) => sum + (sale.totalAmount || 0),
    0,
  );
  const totalTransactions = worker?.sales?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and work preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 text-center">
              <div className="relative inline-block">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={formData.fullName || "Worker"}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-border"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mx-auto border-4 border-border">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {isEditing && (
                  <label className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-accent">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              {isEditing ? (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">
                    Upload Avatar
                  </label>
                  <div className="flex justify-center">
                    <Button variant="outline" size="sm" className="relative">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>
                  </div>
                  {avatarPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={handleRemoveAvatar}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <h2 className="text-xl font-bold">
                    {worker?.fullName || "Worker"}
                  </h2>
                  <p className="text-muted-foreground">
                    {worker?.role || "Staff"}
                  </p>

                  {worker?.isVerified && (
                    <div className="mt-2 inline-flex items-center gap-1 bg-success/10 text-success px-3 py-1 rounded-full text-sm">
                      <ShieldCheck className="h-4 w-4" />
                      Verified Worker
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-muted border-t border-border">
              <h3 className="font-semibold">Business Information</h3>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Business</p>
                  <p className="font-medium">{worker?.business?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Business Type</p>
                  <p className="font-medium">
                    {worker?.business?.businessType === "ARTISAN" &&
                      "🎨 Artisan & Handcrafted Goods"}
                    {worker?.business?.businessType === "BOOKSTORE" &&
                      "📚 Bookstore & Stationery"}
                    {worker?.business?.businessType === "ELECTRONICS" &&
                      "🔌 Electronics & Gadgets"}
                    {worker?.business?.businessType === "HARDWARE" &&
                      "🔨 Hardware & Tools"}
                    {worker?.business?.businessType === "GROCERY" &&
                      "🛒 Grocery & Convenience"}
                    {worker?.business?.businessType === "CAFE" &&
                      "☕ Café & Coffee Shops"}
                    {worker?.business?.businessType === "RESTAURANT" &&
                      "🍽️ Restaurant & Dining"}
                    {worker?.business?.businessType === "RETAIL" &&
                      "🏬 Retail & General Stores"}
                    {worker?.business?.businessType === "BAR" && "🍷 Bar & Pub"}
                    {worker?.business?.businessType === "CLOTHING" &&
                      "👕 Clothing & Accessories"}
                    {!worker?.business?.businessType && "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Worker Since</p>
                  <p className="font-medium">
                    {worker?.createdAt
                      ? new Date(worker.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
              <h2 className="font-semibold">Personal Information</h2>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="text-sm font-medium mb-1 flex items-center gap-2"
                      >
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
                      <label
                        htmlFor="email"
                        className="text-sm font-medium mb-1 flex items-center gap-2"
                      >
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
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed. Contact admin to update.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium mb-1 flex items-center gap-2"
                    >
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

                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium mb-1"
                    >
                      Position
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-border rounded-md"
                    >
                      <option value="STAFF">Staff</option>
                      <option value="MANAGER">Manager</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="ASSISTANT">Assistant</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium mb-1"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell customers about yourself..."
                      rows={4}
                      className="w-full p-2 border border-border rounded-md"
                    ></textarea>
                    <p className="text-xs text-muted-foreground mt-1">
                      This will appear on your business profile to customers
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        fullName: worker?.fullName || "",
                        email: worker?.email || "",
                        phone: worker?.phone || "",
                        role: worker?.role || "",
                        bio: worker?.bio || "",
                      });
                      setAvatarFile(null);
                      setAvatarPreview(worker?.avatar || null);
                    }}
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
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-1">Full Name</h3>
                    <p className="text-muted-foreground">
                      {worker?.fullName || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-1">Email Address</h3>
                    <p className="text-muted-foreground">
                      {worker?.email || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-1">Phone Number</h3>
                    <p className="text-muted-foreground">
                      {worker?.phone || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-1">Position</h3>
                    <p className="text-muted-foreground">
                      {worker?.role || "Staff"}
                    </p>
                  </div>
                </div>

                {worker?.bio && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-1">Bio</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {worker.bio}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Shifts */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 bg-muted border-b border-border">
              <h2 className="font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Shifts
              </h2>
            </div>

            <div className="p-4">
              {recentShifts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent shifts</p>
                  <p className="text-sm mt-1">
                    Your shift history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentShifts.map((shift: any) => (
                    <div
                      key={shift.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(shift.startTime).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(shift.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -
                          {shift.endTime
                            ? new Date(shift.endTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "In Progress"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ${shift.sales?.toFixed(2) || "0.00"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {shift.transactions || 0} sales
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 bg-muted border-b border-border">
              <h2 className="font-semibold">Performance Summary</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border border-border rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {totalSales || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Sales
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-success">
                    {totalTransactions || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Transactions
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-warning">
                    {worker?.customerSatisfaction?.toFixed(1) || "4.7"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customer Rating
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-info">
                    {worker?.attendanceRate?.toFixed(1) || "95.2"}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Attendance Rate
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Performance Tips</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {worker?.business?.businessType === "CAFE" &&
                        "Café workers perform best during morning rush (7-10 AM) and afternoon coffee breaks (2-4 PM)."}
                      {worker?.business?.businessType === "HARDWARE" &&
                        "Hardware workers should focus on detailed product knowledge to assist customers with complex purchases."}
                      {worker?.business?.businessType === "ELECTRONICS" &&
                        "Electronics workers should stay updated on new product features and warranty information."}
                      {!worker?.business?.businessType &&
                        "Maintain consistent customer service standards and focus on sales targets."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
