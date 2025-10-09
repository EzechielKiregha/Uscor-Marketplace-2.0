// app/business/settings/_hooks/use-settings.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { 
  GET_BUSINESS_SETTINGS,
  GET_HARDWARE_RECOMMENDATIONS,
  GET_PRICING_PLANS,
  UPDATE_BUSINESS_PROFILE,
  UPDATE_PAYMENT_CONFIG,
  UPDATE_HARDWARE_CONFIG,
  UPLOAD_KYC_DOCUMENT,
  SUBMIT_KYC,
  UPDATE_PRICING_PLAN,
  AGREE_TO_TERMS,
  ON_SETTINGS_UPDATED
} from '@/graphql/settings.gql';
import { useToast } from '@/components/toast-provider';

export const useSettings = (businessId: string) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'payment' | 'hardware' | 'kyc' | 'pricing' | 'preferences'>('profile');
  const {showToast} = useToast();
  const { 
     data : businessData,
    loading: businessLoading,
    refetch: refetchBusiness
  } = useQuery(GET_BUSINESS_SETTINGS, {
    variables: { id: businessId },
    skip: !businessId
  });

  const { 
     data : hardwareRecommendationsData,
    loading: hardwareLoading,
    refetch: refetchHardware
  } = useQuery(GET_HARDWARE_RECOMMENDATIONS, {
    variables: { 
      businessType: businessData?.business?.businessType || 'ARTISAN',
      country: businessData?.business?.country || 'RWANDA'
    },
    skip: !businessData?.business?.businessType || !businessData?.business?.country
  });

  const { 
    data : pricingPlansData,
    loading: pricingLoading,
    refetch: refetchPricing
  } = useQuery(GET_PRICING_PLANS);

  const [updateProfile] = useMutation(UPDATE_BUSINESS_PROFILE);
  const [updatePaymentConfig] = useMutation(UPDATE_PAYMENT_CONFIG);
  const [updateHardwareConfig] = useMutation(UPDATE_HARDWARE_CONFIG);
  const [uploadKycDocument] = useMutation(UPLOAD_KYC_DOCUMENT);
  const [submitKyc] = useMutation(SUBMIT_KYC);
  const [updatePricingPlan] = useMutation(UPDATE_PRICING_PLAN);
  const [agreeToTerms] = useMutation(AGREE_TO_TERMS);

  // Handle real-time settings updates
  useSubscription(ON_SETTINGS_UPDATED, {
    variables: { businessId },
    onData: ({ data }) => {
      refetchBusiness();
    }
  });

  // Update profile
  const updateProfileInfo = async (input: any) => {
    try {
      await updateProfile({
        variables: { 
          id: businessId, 
          input 
        }
      });
      showToast('success', 'Success', 'Profile updated successfully');
      refetchBusiness();
      refetchHardware();
    } catch (error) {
      showToast('error', 'Error', 'Failed to update profile');
      throw error;
    }
  };

  // Update payment configuration
  const updatePaymentConfiguration = async (input: any) => {
    try {
      await updatePaymentConfig({
        variables: { 
          businessId,
          input 
        }
      });
      showToast('success', 'Success', 'Payment configuration updated successfully');
      refetchBusiness();
    } catch (error) {
      showToast('error', 'Error', 'Failed to update payment configuration');
      throw error;
    }
  };

  // Update hardware configuration
  const updateHardwareConfiguration = async (input: any) => {
    try {
      await updateHardwareConfig({
        variables: { 
          businessId,
          input 
        }
      });
      showToast('success', 'Success', 'Hardware configuration updated successfully');
      refetchBusiness();
    } catch (error) {
      showToast('error', 'Error', 'Failed to update hardware configuration');
      throw error;
    }
  };

  // Upload KYC document
  const uploadDocument = async (input: any) => {
    try {
      const { data } = await uploadKycDocument({
        variables: { input }
      });
      showToast('success', 'Success', 'Document uploaded successfully');
      refetchBusiness();
      return data.uploadKycDocument;
    } catch (error) {
      showToast('error', 'Error', 'Failed to upload document');
      throw error;
    }
  };

  // Submit KYC for verification
  const submitForVerification = async () => {
    try {
      await submitKyc({
        variables: { businessId }
      });
      showToast('success', 'Success', 'KYC submitted for verification');
      refetchBusiness();
    } catch (error) {
      showToast('error', 'Error', 'Failed to submit KYC');
      throw error;
    }
  };

  // Update pricing plan
  const changePricingPlan = async (planId: string) => {
    try {
      await updatePricingPlan({
        variables: { planId }
      });
      showToast('success', 'Success', 'Pricing plan updated successfully');
      refetchPricing();
      refetchBusiness();
    } catch (error) {
      showToast('error', 'Error', 'Failed to update pricing plan');
      throw error;
    }
  };

  // Agree to terms
  const agreeToBusinessTerms = async () => {
    try {
      await agreeToTerms({
        variables: { businessId }
      });
      showToast('success', 'Success', 'Terms agreement updated');
      refetchBusiness();
    } catch (error) {
      showToast('error', 'Error', 'Failed to update terms agreement');
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

  // Get pricing plans
  const getPricingPlans = () => {
    return pricingPlansData?.pricingPlans || [];
  };

  return {
    activeSection,
    setActiveSection,
    getBusinessSettings,
    getHardwareRecommendations,
    getPricingPlans,
    updateProfileInfo,
    updatePaymentConfiguration,
    updateHardwareConfiguration,
    uploadDocument,
    submitForVerification,
    changePricingPlan,
    agreeToBusinessTerms,
    businessLoading,
    hardwareLoading,
    pricingLoading
  };
};