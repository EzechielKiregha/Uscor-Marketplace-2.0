import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignInInput } from './dto/signin.input';
import { AuthPayloadBusiness, AuthPayloadClient, AuthPayloadWorker } from './entities/auth-payload.entity';
import { JwtService } from '@nestjs/jwt';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService, private jwtService: JwtService) {}

  @Mutation(() => AuthPayloadClient)
  async signIn(@Args('SignInInput') signInInput: SignInInput) {
    const client = await this.authService.validateUser(signInInput.email, signInInput.password, "client");
    
    return this.authService.loginClient(client);
  }
  @Mutation(() => AuthPayloadBusiness)
  async signBusinessIn(@Args('SignInInput') signInInput: SignInInput) {
    const business = await this.authService.validateUser(signInInput.email, signInInput.password, "business");

    return this.authService.loginBusiness(business);
  }
  @Mutation(() => AuthPayloadWorker)
  async signWorkerIn(@Args('SignInInput') signInInput: SignInInput) {
    const worker = await this.authService.validateUser(signInInput.email, signInInput.password, "worker");

    return this.authService.loginWorker(worker);
  }

  @Mutation(() => AuthPayloadClient)
  async refreshToken(@Args('refreshToken') refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken);
    const { accessToken } = await this.authService.generateToken(payload.sub, payload.role);
    return { accessToken };
  }
}



