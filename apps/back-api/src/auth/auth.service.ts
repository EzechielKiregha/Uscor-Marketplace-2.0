import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'
import { PrismaService } from '../prisma/prisma.service'
import { AuthJwtPayload } from './types/auth-jwtpayload'
import {
  Business,
  Client,
  Worker,
  Admin,
} from '../generated/prisma/client'
import { UserPayload } from './entities/auth-payload.entity'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getUserRole(
    email: string,
    password: string,
  ) {
    // Check Admin first, then other roles
    const admin = await this.prisma.admin.findUnique({ where: { email } })
    if (admin) return { role: 'admin' }

    const client = await this.prisma.client.findUnique({ where: { email } })
    if (client) {
      return { role: 'client' }
    }

    const business = await this.prisma.business.findUnique({ where: { email } })
    if (business) {
      return { role: 'business' }
    }
    
    const worker = await this.prisma.worker.findUnique({ where: { email } })
    if (worker) {
      return { role: 'worker' }
    }
    
    // If no user found, throw an error instead of returning a string
    throw new UnauthorizedException('User not found')
  }
  async validateUser(
    email: string,
    password: string,
    role: string,
  ) {
    let user
    if (role === 'client') {
      user = await this.prisma.client.findUnique({ where: { email } })
    } else if (role === 'business') {
      user = await this.prisma.business.findUnique({ where: { email } })
    } else if (role === 'worker') {
      user = await this.prisma.worker.findUnique({ where: { email } })
    } else if (role === 'admin') {
      user = await this.prisma.admin.findUnique({ where: { email } })
    } else {
      throw new UnauthorizedException('Invalid role')
    }

    if (!user) {
      throw new UnauthorizedException(`${role} not found`)
    }

    const isValid = await verify(user.password, password)
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // update lastLogin for the user
    try {
      if (role === 'client') {
        await this.prisma.client.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
      } else if (role === 'business') {
        await this.prisma.business.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
      } else if (role === 'worker') {
        await this.prisma.worker.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
      } else if (role === 'admin') {
        await (this.prisma as any).admin.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
      }
    } catch (err) {
      // ignore logging failure
    }

    return user
  }

  async generateToken(
    userId: string,
    role: string,
  ) {
    // Implement your token generation logic here
    let user
    if (role === 'client') {
      user = await this.prisma.client.findUnique({
        where: { id: userId },
      })
    } else if (role === 'business') {
      user =
        await this.prisma.business.findUnique({
          where: { id: userId },
        })
    } else if (role === 'worker') {
      user = await this.prisma.worker.findUnique({ where: { id: userId } })
    } else if (role === 'admin') {
      user = await this.prisma.admin.findUnique({ where: { id: userId } })
    } else {
      throw new UnauthorizedException('Invalid role')
    }

    if (!user) {
      throw new UnauthorizedException(`${role} not found`)
    }
    // Generate a token (e.g., JWT) and return it
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
      refreshToken, // Now included in the response
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
      refreshToken, // Now included in the response
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
      refreshToken, // Now included in the response
    }
  }
  async loginAdmin(admin: Admin) {
    const { accessToken, refreshToken } =
      await this.generateToken(
        admin.id,
        'admin',
      )
    return {
      id: admin.id,
      email: admin.email,
      fullname: admin.fullName,
      phone: admin.phone,
      accessToken,
      refreshToken, // Now included in the response
    }
  }

  async validateCurrentAccountJwt(
    id: string,
    role: string,
  ) {
    if (role === 'client') {
      const userAccount =
        await this.prisma.client.findUnique({
          where: { id },
        })

      if (!userAccount) {
        throw new UnauthorizedException(
          'Acount not found',
        )
      }
      const currentAccount = {
        id: userAccount.id,
        role,
      }
      return currentAccount
    } else if (role === 'business') {
      const userAccountBusiness =
        await this.prisma.business.findUnique({
          where: { id },
        })

      if (!userAccountBusiness) {
        throw new UnauthorizedException(
          'Acount not found',
        )
      }
      const currentAccount = {
        id: userAccountBusiness.id,
        role,
      }
      return currentAccount
    } else if (role === 'worker') {
      const userAccountWorker =
        await this.prisma.worker.findUnique({
          where: { id },
        })
      if (!userAccountWorker) {
        throw new UnauthorizedException(
          'Acount not found',
        )
      }
      const currentAccount = {
        id: userAccountWorker.id,
        role,
      }
      return currentAccount
    } else if (role === 'admin') {
      const userAccountAdmin = await this.prisma.admin.findUnique({ where: { id } })
      if (!userAccountAdmin) {
        throw new UnauthorizedException('Acount not found')
      }
      return { id: userAccountAdmin.id, role }
    } else {
      throw new UnauthorizedException('Unauthorized Role so far')
    }
  }
}
