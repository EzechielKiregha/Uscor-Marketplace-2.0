"use client";

import { useMutation } from "@apollo/client";
import {
  Briefcase,
  Loader2,
  Lock,
  Mail,
  Phone,
  Text,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ADD_WORKER_TO_STORE } from "@/graphql/store.gql";

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  businessId: string;
}

type WorkerMode = "EXISTING" | "NEW";

export default function AddWorkerModal({
  isOpen,
  onClose,
  storeId,
  businessId,
}: AddWorkerModalProps) {
  const { showToast } = useToast();

  const [mode, setMode] = useState<WorkerMode>("EXISTING");

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    password: "",
    bio: "",
    role: "STAFF",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addWorker] = useMutation(ADD_WORKER_TO_STORE);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      email: "",
      fullName: "",
      phone: "",
      password: "",
      bio: "",
      role: "STAFF",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      return showToast("error", "Validation Error", "Email is required");
    }

    if (mode === "NEW") {
      if (!formData.fullName || !formData.password) {
        return showToast(
          "error",
          "Validation Error",
          "Full name and password are required",
        );
      }
    }

    setIsSubmitting(true);

    try {
      await addWorker({
        variables: {
          input: {
            storeId,
            email: formData.email,
            createNewWorker: mode === "NEW",
          },
          inputWorker:
            mode === "NEW"
              ? {
                  email: formData.email,
                  fullName: formData.fullName,
                  phone: formData.phone,
                  password: mode === "NEW" ? formData.password : undefined,
                  bio: formData.bio || "New Worker",
                  isVerified: true,
                  role: formData.role,
                  storeId,
                  businessId,
                  createNewWorker: mode === "NEW",
                }
              : undefined,
          skip: !businessId && !storeId,
        },
      });

      showToast(
        "success",
        mode === "NEW" ? "Worker Created" : "Worker Added",
        mode === "NEW"
          ? `${formData.fullName} has been created and assigned`
          : "Worker assigned successfully",
      );

      resetForm();
      onClose();
    } catch (error: any) {
      showToast("error", "Error", error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-xl overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-4 sm:p-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold">
              <UserPlus className="h-5 w-5 text-primary" />
              Add Worker
            </h2>

            <p className="text-sm text-muted-foreground mt-1">
              Assign or create a worker for this store
            </p>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 p-4">
          <Button
            type="button"
            variant={mode === "EXISTING" ? "default" : "outline"}
            onClick={() => setMode("EXISTING")}
          >
            Existing Worker
          </Button>

          <Button
            type="button"
            variant={mode === "NEW" ? "default" : "outline"}
            onClick={() => setMode("NEW")}
          >
            New Worker
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </label>

              <Input
                name="email"
                type="email"
                placeholder="worker@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Role
              </label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
                <option value="FREELANCER">Freelancer</option>
              </select>
            </div>

            {/* NEW WORKER FIELDS */}
            {mode === "NEW" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </label>

                  <Input
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone
                  </label>

                  <Input
                    name="phone"
                    placeholder="+250..."
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Password
                  </label>

                  <Input
                    name="password"
                    type="password"
                    placeholder="Enter temporary password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Text className="h-4 w-4 text-muted-foreground" />
                    Quick Bio
                  </label>

                  <Textarea
                    name="bio"
                    placeholder="Enter temporary a quick bio"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : mode === "NEW" ? (
                "Create Worker"
              ) : (
                "Add Worker"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
