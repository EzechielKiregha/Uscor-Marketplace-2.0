// app/business/loyalty/_hooks/use-loyalty.ts

import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { useCallback, useState } from "react";
import { useToast } from "@/components/toast-provider";
import {
	CREATE_LOYALTY_PROGRAM,
	EARN_POINTS,
	GET_LOYALTY_ANALYTICS,
	GET_LOYALTY_PROGRAMS,
	ON_LOYALTY_PROGRAM_CREATED,
	ON_LOYALTY_PROGRAM_UPDATED,
	ON_POINTS_EARNED,
	ON_POINTS_REDEEMED,
	REDEEM_POINTS,
	UPDATE_LOYALTY_PROGRAM,
} from "@/graphql/loyalty.gql";

export const useLoyalty = (businessId: string) => {
	const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
		null,
	);
	const { showToast } = useToast();

	const {
		data: programsData,
		loading: programsLoading,
		refetch: refetchPrograms,
	} = useQuery(GET_LOYALTY_PROGRAMS, {
		variables: { businessId },
		skip: !businessId,
	});

	const {
		data: analyticsData,
		loading: analyticsLoading,
		refetch: refetchAnalytics,
	} = useQuery(GET_LOYALTY_ANALYTICS, {
		variables: {
			businessId,
			period: "month",
		},
		skip: !businessId,
	});

	const [createProgramMutation] = useMutation(CREATE_LOYALTY_PROGRAM);
	const [updateProgramMutation] = useMutation(UPDATE_LOYALTY_PROGRAM);
	const [earnPointsMutation] = useMutation(EARN_POINTS);
	const [redeemPointsMutation] = useMutation(REDEEM_POINTS);

	// Handle real-time updates
	useSubscription(ON_LOYALTY_PROGRAM_CREATED, {
		variables: { businessId },
		onData: ({ data }) => {
			refetchPrograms();
			refetchAnalytics();
		},
	});

	useSubscription(ON_LOYALTY_PROGRAM_UPDATED, {
		variables: { businessId },
		onData: ({ data }) => {
			refetchPrograms();
			refetchAnalytics();
		},
	});

	useSubscription(ON_POINTS_EARNED, {
		variables: { businessId },
		onData: ({ data }) => {
			refetchAnalytics();
		},
	});

	useSubscription(ON_POINTS_REDEEMED, {
		variables: { businessId },
		onData: ({ data }) => {
			refetchAnalytics();
		},
	});

	// Create a new loyalty program
	const createProgram = useCallback(
		async (input: any) => {
			try {
				const { data } = await createProgramMutation({
					variables: { input },
				});
				showToast("success", "Success", "Loyalty program created");
				return data.createLoyaltyProgram;
			} catch (error) {
				showToast("error", "Error", "Failed to create loyalty program");
				throw error;
			}
		},
		[createProgramMutation, showToast],
	);

	// Update loyalty program
	const updateProgram = useCallback(
		async (id: string, input: any) => {
			try {
				const { data } = await updateProgramMutation({
					variables: { id, input },
				});
				showToast("success", "Success", "Loyalty program updated");
				return data.updateLoyaltyProgram;
			} catch (error) {
				showToast("error", "Error", "Failed to update loyalty program");
				throw error;
			}
		},
		[updateProgramMutation, showToast],
	);

	// Earn points for a customer
	const earnPoints = useCallback(
		async (input: any) => {
			try {
				const { data } = await earnPointsMutation({
					variables: { input },
				});
				showToast("success", "Points Added", "Customer earned points");
				return data.earnPoints;
			} catch (error) {
				showToast("error", "Error", "Failed to add points");
				throw error;
			}
		},
		[earnPointsMutation, showToast],
	);

	// Redeem points for a customer
	const redeemPoints = useCallback(
		async (input: any) => {
			try {
				const { data } = await redeemPointsMutation({
					variables: { input },
				});
				showToast("success", "Points Redeemed", "Customer redeemed points");
				return data.redeemPoints;
			} catch (error) {
				showToast("error", "Error", "Failed to redeem points");
				throw error;
			}
		},
		[redeemPointsMutation, showToast],
	);

	// Get loyalty programs
	const getPrograms = useCallback(() => {
		return programsData?.loyaltyPrograms || [];
	}, [programsData]);

	// Get selected program
	const getSelectedProgram = useCallback(() => {
		if (!selectedProgramId || !programsData?.loyaltyPrograms) return null;
		return programsData.loyaltyPrograms.find(
			(p: any) => p.id === selectedProgramId,
		);
	}, [selectedProgramId, programsData]);

	// Get analytics data
	const getAnalytics = useCallback(() => {
		return analyticsData?.loyaltyAnalytics;
	}, [analyticsData]);

	return {
		selectedProgramId,
		setSelectedProgramId,
		getPrograms,
		getSelectedProgram,
		getAnalytics,
		createProgram,
		updateProgram,
		earnPoints,
		redeemPoints,
		programsLoading,
		analyticsLoading,
	};
};
