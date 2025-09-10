import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql'
import { AuthService } from './auth.service'
import { SignInInput } from './dto/signin.input'
import {
  AuthPayload,
  AuthPayloadBusiness,
  AuthPayloadClient,
  AuthPayloadWorker,
  UserPayload,
} from './entities/auth-payload.entity'
import { JwtService } from '@nestjs/jwt'
import { UnauthorizedException } from '@nestjs/common'

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Query(() => UserPayload)
  async whatIsUserRole(
    @Args('SignInInput') signInInput: SignInInput,
  ) {
    return await this.authService.getUserRole(
      signInInput.email,
      signInInput.password,
    )
  }
  @Mutation(() => AuthPayloadClient)
  async signClientIn(
    @Args('SignInInput') signInInput: SignInInput,
  ) {
    const client =
      await this.authService.validateUser(
        signInInput.email,
        signInInput.password,
        'client',
      )

    return this.authService.loginClient(client)
  }
  @Mutation(() => AuthPayloadBusiness)
  async signBusinessIn(
    @Args('SignInInput') signInInput: SignInInput,
  ) {
    const business =
      await this.authService.validateUser(
        signInInput.email,
        signInInput.password,
        'business',
      )

    return this.authService.loginBusiness(
      business,
    )
  }
  @Mutation(() => AuthPayloadWorker)
  async signWorkerIn(
    @Args('SignInInput') signInInput: SignInInput,
  ) {
    const worker =
      await this.authService.validateUser(
        signInInput.email,
        signInInput.password,
        'worker',
      )

    return this.authService.loginWorker(worker)
  }

  @Mutation(() => AuthPayloadClient)
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
  ) {
    const payload =
      await this.jwtService.verifyAsync(
        refreshToken,
      )
    const { accessToken } =
      await this.authService.generateToken(
        payload.sub,
        payload.role,
      )
    return { accessToken }
  }

  @Query(() => AuthPayload)
  async verifyCurrentUser(
    @Context() context: any,
  ) {
    const authHeader =
      context.req.headers.authorization
    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      throw new UnauthorizedException(
        'No token provided',
      )
    }

    const token = authHeader.replace(
      'Bearer ',
      '',
    )
    try {
      const payload =
        await this.jwtService.verifyAsync(token)
      const user =
        await this.authService.validateCurrentAccountJwt(
          payload.sub,
          payload.role,
        )
      return { id: user.id, role: user.role }
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid token',
      )
    }
  }
}
