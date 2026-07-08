// app/business/settings/_hooks/use-settings.ts

import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { useState } from "react";
import { useToast } from "@/components/toast-provider";
import { SUBMIT_KYC, UPLOAD_KYC_DOCUMENT } from "@/graphql/kyc.gql";
import {
  AGREE_TO_TERMS,
  GET_BUSINESS_SETTINGS,
  GET_HARDWARE_RECOMMENDATIONS,
  ON_SETTINGS_UPDATED,
  UPDATE_BUSINESS_PROFILE,
  UPDATE_HARDWARE_CONFIG,
  UPDATE_PAYMENT_CONFIG,
} from "@/graphql/settings.gql";

export const useSettings = (businessId: string) => {
  const [activeSection, setActiveSection] = useState<
    | "profile"
    | "payment"
    | "hardware"
    | "kyc"
    | "pricing"
    | "preferences"
    | "security"
  >("profile");
  const { showToast } = useToast();
  const {
    data: businessData,
    loading: businessLoading,
    refetch: refetchBusiness,
  } = useQuery(GET_BUSINESS_SETTINGS, {
    variables: { id: businessId },
    skip: !businessId,
  });

  const {
    data: hardwareRecommendationsData,
    loading: hardwareLoading,
    refetch: refetchHardware,
  } = useQuery(GET_HARDWARE_RECOMMENDATIONS, {
    variables: {
      businessType: businessData?.business?.businessType || "ARTISAN",
      country: businessData?.business?.country || "RWANDA",
    },
    skip:
      !businessData?.business?.businessType || !businessData?.business?.country,
  });

  const [updateProfile] = useMutation(UPDATE_BUSINESS_PROFILE);
  const [updatePaymentConfig] = useMutation(UPDATE_PAYMENT_CONFIG);
  const [updateHardwareConfig] = useMutation(UPDATE_HARDWARE_CONFIG);
  const [uploadKycDocument] = useMutation(UPLOAD_KYC_DOCUMENT);
  const [submitKyc] = useMutation(SUBMIT_KYC);
  const [agreeToTerms] = useMutation(AGREE_TO_TERMS);

  // Handle real-time settings updates
  useSubscription(ON_SETTINGS_UPDATED, {
    variables: { businessId },
    onData: ({ data }) => {
      refetchBusiness();
    },
  });

  // Update profile
  const updateProfileInfo = async (input: any) => {
    try {
      await updateProfile({
        variables: {
          id: businessId,
          input,
        },
      });
      showToast("success", "Success", "Profile updated successfully");
      refetchBusiness();
      refetchHardware();
    } catch (error) {
      showToast("error", "Error", "Failed to update profile");
      throw error;
    }
  };

  // Update payment configuration
  const updatePaymentConfiguration = async (input: any) => {
    try {
      await updatePaymentConfig({
        variables: {
          businessId,
          input,
        },
      });
      showToast(
        "success",
        "Success",
        "Payment configuration updated successfully",
      );
      refetchBusiness();
    } catch (error) {
      showToast("error", "Error", "Failed to update payment configuration");
      throw error;
    }
  };

  // Update hardware configuration
  const updateHardwareConfiguration = async (input: any) => {
    try {
      await updateHardwareConfig({
        variables: {
          businessId,
          input,
        },
      });
      showToast(
        "success",
        "Success",
        "Hardware configuration updated successfully",
      );
      refetchBusiness();
    } catch (error) {
      showToast("error", "Error", "Failed to update hardware configuration");
      throw error;
    }
  };

  // Upload KYC document
  const uploadDocument = async (input: any) => {
    try {
      const { data } = await uploadKycDocument({
        variables: { input },
      });
      showToast("success", "Success", "Document uploaded successfully");
      refetchBusiness();
      return data.uploadKycDocument;
    } catch (error) {
      showToast("error", "Error", "Failed to upload document");
      throw error;
    }
  };

  // Submit KYC for verification
  const submitForVerification = async () => {
    try {
      await submitKyc({
        variables: { businessId },
      });
      showToast("success", "Success", "KYC submitted for verification");
      refetchBusiness();
    } catch (error) {
      showToast("error", "Error", "Failed to submit KYC");
      throw error;
    }
  };

  // Agree to terms
  const agreeToBusinessTerms = async () => {
    try {
      await agreeToTerms({
        variables: { businessId },
      });
      showToast("success", "Success", "Terms agreement updated");
      refetchBusiness();
    } catch (error) {
      showToast("error", "Error", "Failed to update terms agreement");
      throw error;
    }
  };

  // Get business settings
  const getBusinessSettings = () => {
    return businessData?.business;
  };

  // Get hardware recommendations
  const getHardwareRecommendations = () => {
    return hardwareRecommendationsData?.hardwareRecommendations || [];
  };

  return {
    activeSection,
    setActiveSection,
    getBusinessSettings,
    getHardwareRecommendations,
    updateProfileInfo,
    updatePaymentConfiguration,
    updateHardwareConfiguration,
    uploadDocument,
    submitForVerification,
    agreeToBusinessTerms,
    businessLoading,
    hardwareLoading,
  };
};
