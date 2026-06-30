"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMe } from "./fetchMe";
import {
	AdminEntity,
	BusinessEntity,
	ClientEntity,
	WorkerEntity,
} from "./types";
import { useQuery } from "@apollo/client";
import { GET_POINTS_TRANSACTIONS, GET_POINTS_TRANSACTIONS_BY_CLIENT } from "@/graphql/loyalty.gql";
import { getActiveOfflineSession, isOfflineMode } from "./auth";

type MeResult =
	| { role: "client"; id: string; user: ClientEntity }
	| { role: "business"; id: string; user: BusinessEntity }
	| { role: "worker"; id: string; user: WorkerEntity }
	| null;

export function useMe() {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<
		ClientEntity | BusinessEntity | WorkerEntity | AdminEntity | null
	>(null);
	const [points, setPoints] = useState<number>(0);
	const [role, setRole] = useState<
		"client" | "business" | "worker" | "admin" | null
	>(null);
	const [id, setId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isOfflineSession, setIsOfflineSession] = useState(false);
	const router = useRouter();
	const path = usePathname();

	const {
		data,
	} = useQuery(GET_POINTS_TRANSACTIONS_BY_CLIENT, {
		variables: {
			clientId: role === "client" ? id : undefined,
		},
		skip: !id || !role || role === "worker" || role === "admin" || role === "business",
	});

	useEffect(() => {
		if (data && data.pointsTransactions) {
			console.log("Fetched points transactions:", data.pointsTransactions);
			// Calculate total points from transactions
			const totalPoints = data.pointsTransactionsByClient.reduce(
				(sum: number, transaction: any) => sum + transaction.points,
				0
			);
			setPoints(totalPoints);
		}
	}, [data]);


	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			try {
				// Check for offline worker session first
				if (isOfflineMode()) {
					const offlineSession = getActiveOfflineSession();
					if (offlineSession) {
						if (!mounted) return;
						const profile = offlineSession.workerProfile;
						setUser({
							id: profile.id,
							email: profile.email,
							fullName: profile.fullName || "",
							avatar: profile.avatar || null,
							role: profile.role as any,
							phone: "",
							bio: null,
							businessId: offlineSession.businessInfo.id,
							isVerified: true,
						} as WorkerEntity);
						setRole("worker");
						setId(profile.id);
						setIsOfflineSession(true);
						setLoading(false);
						return;
					}
				}

				const res = await fetchMe();
				if (!mounted) return;
				if (!res) {
					setError("Failed to fetch user profile. Please log in again.");
					setUser(null);
					setRole(null);
					setId(null);
					setIsOfflineSession(false);
				} else {
					setUser(res.user);
					setRole(res.role);
					setId(res.id);
					setIsOfflineSession(false);
				}
			} catch (_err) {
				if (!mounted) return;
				setError("An unexpected error occurred.");
				setUser(null);
				setRole(null);
				setId(null);
				setIsOfflineSession(false);
				if (
					path !== "/" &&
					path !== "/marketplace/products" &&
					path !== "/freelance-gigs"
				)
					router.push("/login");
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [router, path]);

	// Show toast notification for errors
	// useEffect(() => {
	//   if (path !== '/'){
	//     if (error) {
	//       showToast(
	//         'error',
	//         'Failed',
	//         "failed to fetch user profile. Please log in again.",
	//         true,
	//         8000,
	//         'bottom-right'
	//       )
	//     }
	//   }

	// }, [error]);

	return { loading, user, role, id, error, points, isOfflineSession };
}
