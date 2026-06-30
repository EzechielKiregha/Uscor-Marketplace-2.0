"use client";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GlowButton } from "@/components/seraui/GlowButton";
import { useToast } from "@/components/toast-provider";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { CREATE_SUPERADMIN } from "@/graphql/admin.gql";

const schema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	fullName: z.string().min(1, "Full name is required"),
	phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterSuperAdminPage() {
	const router = useRouter();
	const { showToast } = useToast();

	const [createSuperAdmin, { loading }] = useMutation(CREATE_SUPERADMIN, {
		fetchPolicy: "no-cache",
	});

	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: { email: "", password: "", fullName: "", phone: "" },
	});

	const onSubmit = async (data: FormData) => {
		try {
			const { data: res } = await createSuperAdmin({
				variables: { createAdminInput: data },
			});
			if (res?.registerSuperAdmin) {
				showToast(
					"success",
					"Success",
					"Super admin created successfully",
					true,
					8000,
					"bottom-right",
				);
				router.push("/login");
			} else {
				showToast(
					"error",
					"Failed",
					"Unexpected response from server",
					true,
					8000,
					"bottom-right",
				);
			}
		} catch (err: any) {
			const message = err?.message || "Failed to create Super Admin";
			showToast(
				"error",
				"Registration failed",
				message,
				true,
				8000,
				"bottom-right",
			);
		}
	};

	return (
		<div className="relative w-full flex items-center justify-center min-h-screen bg-background">
			<div className="w-full max-w-md p-6 space-y-6 bg-card rounded-xl border border-border shadow-lg">
				<div className="text-center space-y-3">
					<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
						<ShieldCheck className="h-6 w-6 text-primary" />
					</div>
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						Bootstrap Super Admin
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Create the first Super Admin account for the platform.
					</p>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="fullName"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-foreground">Full name</FormLabel>
									<FormControl>
										<input
											type="text"
											placeholder="Jane Doe"
											{...field}
											className="w-full text-foreground bg-muted/50 dark:bg-white/5 border border-border rounded-lg px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-foreground">Email</FormLabel>
									<FormControl>
										<input
											type="email"
											placeholder="admin@example.com"
											{...field}
											className="w-full text-foreground bg-muted/50 dark:bg-white/5 border border-border rounded-lg px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-foreground">Phone (optional)</FormLabel>
									<FormControl>
										<input
											type="tel"
											placeholder="+1234567890"
											{...field}
											className="w-full text-foreground bg-muted/50 dark:bg-white/5 border border-border rounded-lg px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-foreground">Password</FormLabel>
									<FormControl>
										<input
											type="password"
											placeholder="Choose a strong password"
											{...field}
											className="w-full text-foreground bg-muted/50 dark:bg-white/5 border border-border rounded-lg px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<GlowButton
							type="submit"
							disabled={loading}
							className="w-full rounded-lg py-2.5"
						>
							{loading ? "Creating..." : "Create Super Admin"}
						</GlowButton>
					</form>
				</Form>

				<div className="text-center text-sm text-muted-foreground">
					<p>
						Only the first Super Admin can be created here. If a Super Admin
						already exists, please sign in.
					</p>
				</div>
			</div>
		</div>
	);
}
