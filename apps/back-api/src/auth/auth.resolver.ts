import { UnauthorizedException, UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { ChangePasswordInput } from "./dto/change-password.input";
import { ForgotPasswordInput } from "./dto/forgot-password.input";
import { RequestOfflineAccessInput } from "./dto/request-offline-access.input";
import { ResendOtpInput } from "./dto/resend-otp.input";
import { ResetPasswordInput } from "./dto/reset-password.input";
import { SignInInput } from "./dto/signin.input";
import { VerifyEmailInput } from "./dto/verify-email.input";
import {
	AuthPayload,
	AuthPayloadAdmin,
	AuthPayloadBusiness,
	AuthPayloadClient,
	AuthPayloadWorker,
	UserPayload,
} from "./entities/auth-payload.entity";
import { MessageResult } from "./entities/message-result.entity";
import { OfflineAccessPayload } from "./entities/offline-access-payload.entity";
import { SecurityLogEntity } from "./entities/security-log.entity";
import { JwtAuthGuard } from "./guards/jwt-auth/jwt-auth.guard";

@Resolver()
export class AuthResolver {
	constructor(
		private readonly authService: AuthService,
		private jwtService: JwtService,
	) {}

	// ─── Existing Auth Operations ────────────────────────────────

	@Query(() => UserPayload)
	async whatIsUserRole(@Args("SignInInput") signInInput: SignInInput) {
		return await this.authService.getUserRole(
			signInInput.email,
			signInInput.password,
		);
	}

	@Mutation(() => AuthPayloadClient)
	async signClientIn(
		@Args("SignInInput") signInInput: SignInInput,
		@Context() context: any,
	) {
		const ctx = this.extractRequestContext(context);
		const client = await this.authService.validateUser(
			signInInput.email,
			signInInput.password,
			"client",
			ctx,
		);
		return this.authService.loginClient(client);
	}

	@Mutation(() => AuthPayloadBusiness)
	async signBusinessIn(
		@Args("SignInInput") signInInput: SignInInput,
		@Context() context: any,
	) {
		const ctx = this.extractRequestContext(context);
		const business = await this.authService.validateUser(
			signInInput.email,
			signInInput.password,
			"business",
			ctx,
		);
		return this.authService.loginBusiness(business);
	}

	@Mutation(() => AuthPayloadWorker)
	async signWorkerIn(
		@Args("SignInInput") signInInput: SignInInput,
		@Context() context: any,
	) {
		const ctx = this.extractRequestContext(context);
		const worker = await this.authService.validateUser(
			signInInput.email,
			signInInput.password,
			"worker",
			ctx,
		);
		return this.authService.loginWorker(worker);
	}

	@Mutation(() => AuthPayloadAdmin)
	async signAdminIn(
		@Args("SignInInput") signInInput: SignInInput,
		@Context() context: any,
	) {
		const ctx = this.extractRequestContext(context);
		const admin = await this.authService.validateUser(
			signInInput.email,
			signInInput.password,
			"admin",
			ctx,
		);
		return this.authService.loginAdmin(admin);
	}

	private extractRequestContext(context: any) {
		const req = context?.req;
		return {
			ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || undefined,
			userAgent: req?.headers?.["user-agent"] || undefined,
		};
	}

	@Mutation(() => AuthPayloadClient)
	async refreshToken(@Args("refreshToken") refreshToken: string) {
		const payload = await this.jwtService.verifyAsync(refreshToken);
		const { accessToken } = await this.authService.generateToken(
			payload.sub,
			payload.role,
		);
		return { accessToken };
	}

	@Query(() => AuthPayload)
	async verifyCurrentUser(@Context() context: any) {
		const authHeader = context.req.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			throw new UnauthorizedException("No token provided");
		}

		const token = authHeader.replace("Bearer ", "");
		try {
			const payload = await this.jwtService.verifyAsync(token);
			const user = await this.authService.validateCurrentAccountJwt(
				payload.sub,
				payload.role,
			);
			return { id: user.id, role: user.role };
		} catch (_error) {
			throw new UnauthorizedException("Invalid token");
		}
	}

	// ─── New Auth Operations ─────────────────────────────────────

	@Mutation(() => MessageResult)
	async forgotPassword(
		@Args("input") input: ForgotPasswordInput,
	): Promise<MessageResult> {
		return this.authService.forgotPassword(input.email);
	}

	@Mutation(() => MessageResult)
	async resetPassword(
		@Args("input") input: ResetPasswordInput,
	): Promise<MessageResult> {
		return this.authService.resetPassword(input.email, input.otp, input.newPassword);
	}

	@Mutation(() => MessageResult)
	@UseGuards(JwtAuthGuard)
	async changePassword(
		@Args("input") input: ChangePasswordInput,
		@Context() context: any,
	): Promise<MessageResult> {
		const user = context.req.user;
		if (!user?.id || !user?.role) {
			throw new UnauthorizedException("Not authenticated");
		}
		return this.authService.changePassword(
			user.id,
			user.role,
			input.currentPassword,
			input.newPassword,
		);
	}

	@Mutation(() => MessageResult)
	async verifyEmail(
		@Args("input") input: VerifyEmailInput,
	): Promise<MessageResult> {
		return this.authService.verifyEmail(input.email, input.otp);
	}

	@Mutation(() => MessageResult)
	async resendOtp(
		@Args("input") input: ResendOtpInput,
	): Promise<MessageResult> {
		return this.authService.resendOtp(input.email, input.purpose as any);
	}

	@Mutation(() => MessageResult)
	async sendVerificationOtp(
		@Args("email") email: string,
	): Promise<MessageResult> {
		return this.authService.sendVerificationOtp(email);
	}

	@Query(() => [SecurityLogEntity])
	@UseGuards(JwtAuthGuard)
	async securityLogs(@Context() context: any): Promise<SecurityLogEntity[]> {
		const user = context.req.user;
		if (!user?.id) {
			throw new UnauthorizedException("Not authenticated");
		}
		return this.authService.getSecurityLogs(user.id);
	}

	// ─── Offline Login (Worker-Only) ─────────────────────────────

	@Mutation(() => OfflineAccessPayload)
	@UseGuards(JwtAuthGuard)
	async requestOfflineAccess(
		@Args("input") input: RequestOfflineAccessInput,
		@Context() context: any,
	): Promise<OfflineAccessPayload> {
		const user = context.req.user;
		if (!user?.id || user?.role !== "worker") {
			throw new UnauthorizedException("Only workers can request offline access");
		}

		// Register the device as trusted
		const reqCtx = this.extractRequestContext(context);
		await this.authService.registerWorkerDevice(
			user.id,
			input.deviceId,
			reqCtx.userAgent,
			input.deviceName,
		);

		// Generate the offline token
		const payload = await this.authService.generateOfflineToken(user.id);

		await this.authService.logSecurityEvent(user.id, "worker", "OFFLINE_ACCESS_GRANTED", {
			ipAddress: reqCtx.ipAddress,
			userAgent: reqCtx.userAgent,
			deviceId: input.deviceId,
			metadata: { deviceName: input.deviceName },
		});

		return payload;
	}

	@Mutation(() => MessageResult)
	@UseGuards(JwtAuthGuard)
	async revokeOfflineAccess(
		@Args("workerId") workerId: string,
		@Args("deviceId") deviceId: string,
		@Context() context: any,
	): Promise<MessageResult> {
		const user = context.req.user;
		// Only the worker themselves or a business owner can revoke
		if (!user?.id) {
			throw new UnauthorizedException("Not authenticated");
		}
		if (user.role !== "business" && user.id !== workerId) {
			throw new UnauthorizedException("Only business owners or the worker can revoke offline access");
		}

		// Delete the trusted device record
		try {
			await this.authService["prisma"].trustedDevice.delete({
				where: { userId_deviceId: { userId: workerId, deviceId } },
			});
		} catch (_err) {
			return { success: false, message: "Device not found or already revoked." };
		}

		const reqCtx = this.extractRequestContext(context);
		await this.authService.logSecurityEvent(workerId, "worker", "OFFLINE_ACCESS_REVOKED", {
			ipAddress: reqCtx.ipAddress,
			userAgent: reqCtx.userAgent,
			deviceId,
			metadata: { revokedBy: user.id, revokedByRole: user.role },
		});

		return { success: true, message: "Offline access revoked. The device will need to re-authenticate online." };
	}
}
