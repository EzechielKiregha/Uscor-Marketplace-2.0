import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { hash, verify } from 'argon2'
import {
  Admin,
  Business,
  Client,
  Worker,
} from '../generated/prisma/client'
import { MailService } from '../mail/mail.service'
import { OtpService } from '../otp/otp.service'
import { PrismaService } from '../prisma/prisma.service'
import { AuthJwtPayload } from './types/auth-jwtpayload'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(
    AuthService.name,
  )

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private mailService: MailService,
  ) {}

  // ─── Security Logging ────────────────────────────────────────

  async logSecurityEvent(
    userId: string,
    userRole: string,
    action: string,
    context?: {
      ipAddress?: string
      userAgent?: string
      deviceId?: string
      metadata?: any
    },
  ) {
    try {
      await this.prisma.securityLog.create({
        data: {
          userId,
          userRole,
          action,
          ipAddress: context?.ipAddress,
          userAgent: context?.userAgent,
          deviceId: context?.deviceId,
          metadata: context?.metadata,
        },
      })
    } catch (err: any) {
      this.logger.error(
        `Failed to log security event: ${err.message}`,
      )
    }
  }

  // ─── User Lookup Helpers ─────────────────────────────────────

  /**
   * Find a user across all role tables by email
   */
  private async findUserByEmail(
    email: string,
  ): Promise<{ user: any; role: string } | null> {
    const admin =
      await this.prisma.admin.findUnique({
        where: { email },
      })
    if (admin)
      return { user: admin, role: 'admin' }

    const client =
      await this.prisma.client.findUnique({
        where: { email },
      })
    if (client)
      return { user: client, role: 'client' }

    const business =
      await this.prisma.business.findUnique({
        where: { email },
      })
    if (business)
      return { user: business, role: 'business' }

    const worker =
      await this.prisma.worker.findUnique({
        where: { email },
      })
    if (worker)
      return { user: worker, role: 'worker' }

    return null
  }

  /**
   * Update password for a user by email (finds role automatically)
   */
  private async updatePasswordByEmail(
    email: string,
    hashedPassword: string,
  ): Promise<{ role: string; name: string }> {
    const admin =
      await this.prisma.admin.findUnique({
        where: { email },
      })
    if (admin) {
      await this.prisma.admin.update({
        where: { email },
        data: { password: hashedPassword },
      })
      return {
        role: 'admin',
        name: admin.fullName || 'User',
      }
    }

    const client =
      await this.prisma.client.findUnique({
        where: { email },
      })
    if (client) {
      await this.prisma.client.update({
        where: { email },
        data: { password: hashedPassword },
      })
      return {
        role: 'client',
        name: client.fullName || 'User',
      }
    }

    const business =
      await this.prisma.business.findUnique({
        where: { email },
      })
    if (business) {
      await this.prisma.business.update({
        where: { email },
        data: { password: hashedPassword },
      })
      return {
        role: 'business',
        name: business.name || 'User',
      }
    }

    const worker =
      await this.prisma.worker.findUnique({
        where: { email },
      })
    if (worker) {
      await this.prisma.worker.update({
        where: { email },
        data: { password: hashedPassword },
      })
      return {
        role: 'worker',
        name: worker.fullName || 'User',
      }
    }

    throw new BadRequestException(
      'User not found',
    )
  }

  // ─── Existing Auth Methods ───────────────────────────────────

  async getUserRole(
    email: string,
    _password: string,
  ) {
    const admin =
      await this.prisma.admin.findUnique({
        where: { email },
      })
    if (admin) return { role: 'admin' }

    const client =
      await this.prisma.client.findUnique({
        where: { email },
      })
    if (client) return { role: 'client' }

    const business =
      await this.prisma.business.findUnique({
        where: { email },
      })
    if (business) return { role: 'business' }

    const worker =
      await this.prisma.worker.findUnique({
        where: { email },
      })
    if (worker) return { role: 'worker' }

    throw new UnauthorizedException(
      'User not found',
    )
  }

  async validateUser(
    email: string,
    password: string,
    role: string,
    reqContext?: {
      ipAddress?: string
      userAgent?: string
    },
  ) {
    let user: any
    if (role === 'client') {
      user = await this.prisma.client.findUnique({
        where: { email },
      })
    } else if (role === 'business') {
      user =
        await this.prisma.business.findUnique({
          where: { email },
        })
    } else if (role === 'worker') {
      user = await this.prisma.worker.findUnique({
        where: { email },
      })
    } else if (role === 'admin') {
      user = await this.prisma.admin.findUnique({
        where: { email },
      })
    } else {
      throw new UnauthorizedException(
        'Invalid role',
      )
    }

    if (!user) {
      await this.logSecurityEvent(
        'unknown',
        role,
        'FAILED_LOGIN',
        {
          ipAddress: reqContext?.ipAddress,
          userAgent: reqContext?.userAgent,
          metadata: {
            email,
            reason: 'User not found',
          },
        },
      )
      throw new UnauthorizedException(
        `${role} not found`,
      )
    }

    const isValid = await verify(
      user.password,
      password,
    )
    if (!isValid) {
      await this.logSecurityEvent(
        user.id,
        role,
        'FAILED_LOGIN',
        {
          ipAddress: reqContext?.ipAddress,
          userAgent: reqContext?.userAgent,
          metadata: {
            email,
            reason: 'Invalid password',
          },
        },
      )
      throw new UnauthorizedException(
        'Invalid credentials',
      )
    }

    // Update lastLogin
    try {
      const prismaModel = (this.prisma as any)[
        role
      ]
      if (prismaModel) {
        await prismaModel.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })
      }
    } catch (_err) {
      // ignore
    }

    // Log successful login
    await this.logSecurityEvent(
      user.id,
      role,
      'LOGIN',
      {
        ipAddress: reqContext?.ipAddress,
        userAgent: reqContext?.userAgent,
      },
    )

    return user
  }

  async generateToken(
    userId: string,
    role: string,
  ) {
    const prismaModel = (this.prisma as any)[role]
    if (!prismaModel)
      throw new UnauthorizedException(
        'Invalid role',
      )

    const user = await prismaModel.findUnique({
      where: { id: userId },
    })
    if (!user)
      throw new UnauthorizedException(
        `${role} not found`,
      )

    const payload: AuthJwtPayload = {
      sub: userId,
      role,
    }
    const accessToken =
      await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
      })
    const refreshToken =
      await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      })
    return { accessToken, refreshToken }
  }

  async loginClient(client: Client) {
    const { accessToken, refreshToken } =
      await this.generateToken(
        client.id,
        'client',
      )
    return {
      id: client.id,
      email: client.email,
      fullname: client.fullName,
      phone: client.phone,
      avatar: client.avatar,
      accessToken,
      refreshToken,
    }
  }

  async loginBusiness(business: Business) {
    const { accessToken, refreshToken } =
      await this.generateToken(
        business.id,
        'business',
      )
    return {
      id: business.id,
      email: business.email,
      fullname: business.name,
      phone: business.phone,
      avatar: business.avatar,
      coverImage: business.coverImage,
      accessToken,
      refreshToken,
    }
  }

  async loginWorker(worker: Worker) {
    const { accessToken, refreshToken } =
      await this.generateToken(
        worker.id,
        'worker',
      )
    return {
      id: worker.id,
      email: worker.email,
      fullname: worker.fullName,
      phone: worker.phone,
      accessToken,
      refreshToken,
    }
  }

  async loginAdmin(admin: Admin) {
    const { accessToken, refreshToken } =
      await this.generateToken(admin.id, 'admin')
    return {
      id: admin.id,
      email: admin.email,
      fullname: admin.fullName,
      phone: admin.phone,
      accessToken,
      refreshToken,
    }
  }

  async validateCurrentAccountJwt(
    id: string,
    role: string,
  ) {
    const prismaModel = (this.prisma as any)[role]
    if (!prismaModel)
      throw new UnauthorizedException(
        'Unauthorized Role',
      )

    const user = await prismaModel.findUnique({
      where: { id },
    })
    if (!user)
      throw new UnauthorizedException(
        'Account not found',
      )

    return { id: user.id, role }
  }

  // ─── New Auth Methods ────────────────────────────────────────

  /**
   * Forgot Password — sends OTP to user's email
   */
  async forgotPassword(
    email: string,
  ): Promise<{
    success: boolean
    message: string
  }> {
    const found =
      await this.findUserByEmail(email)
    if (!found) {
      // Don't reveal whether email exists — return success anyway
      return {
        success: true,
        message:
          'If an account exists with this email, a reset code has been sent.',
      }
    }

    const result =
      await this.otpService.generateOtp(
        email,
        'PASSWORD_RESET',
      )
    await this.logSecurityEvent(
      found.user.id,
      found.role,
      'OTP_SENT',
      {
        metadata: { purpose: 'PASSWORD_RESET' },
      },
    )

    return {
      success: result.success,
      message:
        'If an account exists with this email, a reset code has been sent.',
    }
  }

  /**
   * Reset Password — verifies OTP then updates password
   */
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<{
    success: boolean
    message: string
  }> {
    // Verify OTP first
    await this.otpService.verifyOtp(
      email,
      otp,
      'PASSWORD_RESET',
    )

    // Hash and update password
    const hashedPassword = await hash(newPassword)
    const { role, name } =
      await this.updatePasswordByEmail(
        email,
        hashedPassword,
      )

    // Log the event
    const found =
      await this.findUserByEmail(email)
    if (found) {
      await this.logSecurityEvent(
        found.user.id,
        role,
        'PASSWORD_RESET',
      )
    }

    // Send notification email
    await this.mailService.sendPasswordChangedEmail(
      email,
      name,
    )

    return {
      success: true,
      message:
        'Password reset successfully. You can now log in with your new password.',
    }
  }

  /**
   * Change Password — for authenticated users
   */
  async changePassword(
    userId: string,
    role: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{
    success: boolean
    message: string
  }> {
    const prismaModel = (this.prisma as any)[role]
    if (!prismaModel)
      throw new BadRequestException(
        'Invalid role',
      )

    const user = await prismaModel.findUnique({
      where: { id: userId },
    })
    if (!user)
      throw new BadRequestException(
        'User not found',
      )

    // Verify current password
    const isValid = await verify(
      user.password,
      currentPassword,
    )
    if (!isValid) {
      throw new BadRequestException(
        'Current password is incorrect',
      )
    }

    // Update password
    const hashedPassword = await hash(newPassword)
    await prismaModel.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    await this.logSecurityEvent(
      userId,
      role,
      'PASSWORD_CHANGE',
    )
    await this.mailService.sendPasswordChangedEmail(
      user.email,
      user.fullName || user.name || 'User',
    )

    return {
      success: true,
      message: 'Password changed successfully.',
    }
  }

  /**
   * Verify Email — marks user as verified
   */
  async verifyEmail(
    email: string,
    otp: string,
  ): Promise<{
    success: boolean
    message: string
  }> {
    await this.otpService.verifyOtp(
      email,
      otp,
      'EMAIL_VERIFICATION',
    )

    // Set isVerified = true across all role tables
    const found =
      await this.findUserByEmail(email)
    if (!found)
      throw new BadRequestException(
        'User not found',
      )

    const prismaModel = (this.prisma as any)[
      found.role
    ]
    // Admin doesn't have isVerified field
    if (found.role !== 'admin' && prismaModel) {
      await prismaModel.update({
        where: { email },
        data: { isVerified: true },
      })
    }

    await this.logSecurityEvent(
      found.user.id,
      found.role,
      'EMAIL_VERIFIED',
    )

    return {
      success: true,
      message: 'Email verified successfully.',
    }
  }

  /**
   * Resend OTP
   */
  async resendOtp(
    email: string,
    purpose:
      | 'EMAIL_VERIFICATION'
      | 'PASSWORD_RESET'
      | 'LOGIN_VERIFICATION',
  ): Promise<{
    success: boolean
    message: string
  }> {
    const found =
      await this.findUserByEmail(email)
    if (!found) {
      return {
        success: true,
        message: `Couldn't find an account with this ${email}.`,
      }
    }

    return this.otpService.generateOtp(
      email,
      purpose,
    )
  }

  /**
   * Get security logs for a user
   */
  async getSecurityLogs(
    userId: string,
    limit = 20,
  ) {
    return this.prisma.securityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Send verification OTP for new registration
   */
  async sendVerificationOtp(
    email: string,
  ): Promise<{
    success: boolean
    message: string
  }> {
    return this.otpService.generateOtp(
      email,
      'EMAIL_VERIFICATION',
    )
  }

  // ─── Offline Login (Worker-Only) ─────────────────────────────

  /** Permissions granted to offline workers */
  private readonly OFFLINE_PERMISSIONS = [
    'pos:create_sale',
    'pos:complete_sale',
    'pos:void_sale',
    'inventory:view',
    'inventory:update_stock',
    'sales:view',
    'receipts:generate',
    'customers:view',
    'customers:lookup',
    'returns:create',
    'shifts:start',
    'shifts:end',
    'shifts:view',
    'queue:manage',
  ]

  /**
   * Generate a long-lived offline JWT (30 days) for a worker.
   * Includes businessId, storeIds, and explicit permission list.
   */
  async generateOfflineToken(workerId: string) {
    const worker =
      await this.prisma.worker.findUnique({
        where: { id: workerId },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              businessType: true,
            },
          },
          stores: {
            select: { id: true, name: true },
          },
        },
      })

    if (!worker)
      throw new UnauthorizedException(
        'Worker not found',
      )

    const payload: AuthJwtPayload = {
      sub: workerId,
      role: 'worker',
      type: 'offline',
      businessId: worker.businessId,
      permissions: this.OFFLINE_PERMISSIONS,
    }

    const offlineToken =
      await this.jwtService.signAsync(payload, {
        expiresIn: '30d',
      })
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    )

    return {
      offlineToken,
      expiresAt,
      permissions: this.OFFLINE_PERMISSIONS,
      workerProfile: {
        id: worker.id,
        email: worker.email,
        fullName: worker.fullName,
        avatar: worker.avatar,
        role: worker.role,
      },
      businessInfo: {
        id: worker.business.id,
        name: worker.business.name,
        businessType:
          worker.business.businessType,
        storeIds: worker.stores.map((s) => s.id),
        storeNames: worker.stores.map(
          (s) => s.name,
        ),
      },
    }
  }

  /**
   * Validate an offline session by checking the worker exists and
   * the device is trusted (registered via registerWorkerDevice).
   */
  async validateOfflineSession(
    workerId: string,
    deviceId: string,
  ) {
    const worker =
      await this.prisma.worker.findUnique({
        where: { id: workerId },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              businessType: true,
            },
          },
          stores: {
            select: { id: true, name: true },
          },
        },
      })

    if (!worker)
      throw new UnauthorizedException(
        'Worker not found',
      )

    const trustedDevice =
      await this.prisma.trustedDevice.findUnique({
        where: {
          userId_deviceId: {
            userId: workerId,
            deviceId,
          },
        },
      })

    if (!trustedDevice) {
      throw new UnauthorizedException(
        'Device not registered for offline access. Please log in online first to enable offline mode.',
      )
    }

    // Update lastUsedAt
    await this.prisma.trustedDevice.update({
      where: { id: trustedDevice.id },
      data: { lastUsedAt: new Date() },
    })

    return {
      valid: true,
      workerProfile: {
        id: worker.id,
        email: worker.email,
        fullName: worker.fullName,
        avatar: worker.avatar,
        role: worker.role,
      },
      businessInfo: {
        id: worker.business.id,
        name: worker.business.name,
        businessType:
          worker.business.businessType,
        storeIds: worker.stores.map((s) => s.id),
        storeNames: worker.stores.map(
          (s) => s.name,
        ),
      },
      device: {
        id: trustedDevice.id,
        deviceName: trustedDevice.deviceName,
        lastUsedAt: trustedDevice.lastUsedAt,
      },
    }
  }

  /**
   * Register (or update) a worker's device as trusted for offline access.
   * Uses upsert on the unique (userId, deviceId) constraint.
   */
  async registerWorkerDevice(
    workerId: string,
    deviceId: string,
    userAgent?: string,
    deviceName?: string,
  ) {
    const worker =
      await this.prisma.worker.findUnique({
        where: { id: workerId },
      })
    if (!worker)
      throw new UnauthorizedException(
        'Worker not found',
      )

    const device =
      await this.prisma.trustedDevice.upsert({
        where: {
          userId_deviceId: {
            userId: workerId,
            deviceId,
          },
        },
        update: {
          userAgent,
          deviceName: deviceName || undefined,
          lastUsedAt: new Date(),
        },
        create: {
          userId: workerId,
          userRole: 'worker',
          deviceId,
          userAgent,
          deviceName,
        },
      })

    await this.logSecurityEvent(
      workerId,
      'worker',
      'DEVICE_REGISTERED',
      {
        deviceId,
        userAgent,
        metadata: {
          deviceName,
          trustedDeviceId: device.id,
        },
      },
    )

    return {
      success: true,
      device: {
        id: device.id,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        registeredAt: device.createdAt,
      },
    }
  }
}
