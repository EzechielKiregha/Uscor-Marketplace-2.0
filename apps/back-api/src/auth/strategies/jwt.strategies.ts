import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt'
import { AuthJwtPayload } from '../types/auth-jwtpayload'
import { AuthService } from '../auth.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'default-secret',
      ignoreExpiration: false,
    })
  }

  async validate(payload: AuthJwtPayload) {
    const id = payload.sub
    const role = payload.role
    const user =
      await this.authService.validateCurrentAccountJwt(
        id,
        role,
      )
    return { id: user.id, role }
  }
}
