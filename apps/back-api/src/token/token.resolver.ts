import { Resolver } from "@nestjs/graphql";
import { TokenEntity } from "./entities/token.entity";
import type { TokenService } from "./token.service";

@Resolver(() => TokenEntity)
export class TokenResolver {
	constructor(readonly _tokenService: TokenService) {}
}
