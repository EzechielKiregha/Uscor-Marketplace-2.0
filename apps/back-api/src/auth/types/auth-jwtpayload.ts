export type AuthJwtPayload = {
  sub: string // Subject (user ID)
  role: string // Role (e.g., "client", "business", "worker")
}
