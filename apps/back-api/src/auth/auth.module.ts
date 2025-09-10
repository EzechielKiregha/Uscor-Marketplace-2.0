import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthResolver } from './auth.resolver'
import { PrismaService } from '../prisma/prisma.service'
import { JwtModule } from '@nestjs/jwt'
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config'
import { JwtStrategy } from './strategies/jwt.strategies'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService,
      ) => ({
        secret:
          configService.get<string>('JWT_SECRET'), // Use the secret from your environment variables
        signOptions: {
          expiresIn: configService.get<string>(
            'JWT_EXPIRES_IN',
          ),
        }, // Token expiration time
      }),
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    PrismaService,
    JwtStrategy,
  ],
})
export class AuthModule {}
