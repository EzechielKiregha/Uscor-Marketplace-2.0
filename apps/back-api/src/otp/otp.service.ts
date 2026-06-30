import {
	BadRequestException,
	Injectable,
	Logger,
} from "@nestjs/common";
import { hash, verify } from "argon2";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OtpService {
	private readonly logger = new Logger(OtpService.name);

	constructor(
		private prisma: PrismaService,
		private mailService: MailService,
	) {}

	/**
	 * Generate a 6-digit OTP, store hashed in DB, send via email
	 */
	async generateOtp(
		email: string,
		purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "LOGIN_VERIFICATION",
	): Promise<{ success: boolean; message: string }> {
		// Invalidate any existing unused OTPs for same email + purpose
		await this.prisma.otp.updateMany({
			where: { email, purpose, usedAt: null },
			data: { usedAt: new Date() },
		});

		// Generate 6-digit OTP
		const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
		const hashedOtp = await hash(plainOtp);

		// Store with 10-minute expiry
		await this.prisma.otp.create({
			data: {
				email,
				code: hashedOtp,
				purpose,
				expiresAt: new Date(Date.now() + 10 * 60 * 1000),
			},
		});

		// Send email
		const sent = await this.mailService.sendOtpEmail(email, plainOtp, purpose);

		if (!sent) {
			this.logger.error(`Failed to send OTP email to ${email}`);
			return { success: false, message: "Failed to send verification email. Please try again." };
		}

		this.logger.log(`OTP generated for ${email} (${purpose})`);
		return { success: true, message: "Verification code sent to your email." };
	}

	/**
	 * Verify an OTP code
	 */
	async verifyOtp(
		email: string,
		code: string,
		purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "LOGIN_VERIFICATION",
	): Promise<{ success: boolean; message: string }> {
		// Find the latest unused OTP for this email + purpose
		const otp = await this.prisma.otp.findFirst({
			where: {
				email,
				purpose,
				usedAt: null,
			},
			orderBy: { createdAt: "desc" },
		});

		if (!otp) {
			throw new BadRequestException("No verification code found. Please request a new one.");
		}

		// Check expiry
		if (new Date() > otp.expiresAt) {
			await this.prisma.otp.update({
				where: { id: otp.id },
				data: { usedAt: new Date() },
			});
			throw new BadRequestException("Verification code has expired. Please request a new one.");
		}

		// Check max retries
		if (otp.attempts >= otp.maxRetries) {
			await this.prisma.otp.update({
				where: { id: otp.id },
				data: { usedAt: new Date() },
			});
			throw new BadRequestException("Too many failed attempts. Please request a new code.");
		}

		// Verify code
		const isValid = await verify(otp.code, code);

		if (!isValid) {
			await this.prisma.otp.update({
				where: { id: otp.id },
				data: { attempts: otp.attempts + 1 },
			});
			const remaining = otp.maxRetries - otp.attempts - 1;
			throw new BadRequestException(
				`Invalid code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
			);
		}

		// Mark as used
		await this.prisma.otp.update({
			where: { id: otp.id },
			data: { usedAt: new Date() },
		});

		this.logger.log(`OTP verified for ${email} (${purpose})`);
		return { success: true, message: "Verification successful." };
	}

	/**
	 * Cleanup expired OTPs (call periodically)
	 */
	async cleanupExpired(): Promise<number> {
		const result = await this.prisma.otp.deleteMany({
			where: {
				OR: [
					{ expiresAt: { lt: new Date() } },
					{ usedAt: { not: null } },
				],
			},
		});
		return result.count;
	}
}
