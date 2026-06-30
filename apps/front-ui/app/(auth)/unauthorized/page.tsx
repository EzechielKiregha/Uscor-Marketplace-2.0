import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { GlowButton } from "@/components/seraui/GlowButton";

export default function UnauthorizedPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="text-center space-y-4 max-w-md px-6">
				<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto">
					<ShieldAlert className="h-8 w-8 text-destructive" />
				</div>
				<h1 className="text-2xl font-bold text-foreground">Unauthorized Access</h1>
				<p className="text-muted-foreground">
					You don&apos;t have permission to access this page.
				</p>
				<Link href="/">
					<GlowButton className="mt-4">Go to Homepage</GlowButton>
				</Link>
			</div>
		</div>
	);
}
