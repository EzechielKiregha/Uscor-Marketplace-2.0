export type AuthJwtPayload = {
	sub: string; // Subject (user ID)
	role: string; // Role (e.g., "client", "business", "worker")
	type?: "online" | "offline"; // Token type — offline tokens have restricted permissions
	businessId?: string; // Worker's parent business (offline tokens only)
	permissions?: string[]; // Explicit permission list (offline tokens only)
};
