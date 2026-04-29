import { Injectable } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { AuthService } from "../auth.service";
import type { AuthJwtPayload } from "../types/auth-jwtpayload";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		configService: ConfigService,
		private authService: AuthService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get<string>("JWT_SECRET") || "default-secret",
			ignoreExpiration: false,
		});
	}

	async validate(payload: AuthJwtPayload) {
		const id = payload.sub;
		const role = payload.role;
		const user = await this.authService.validateCurrentAccountJwt(id, role);
		return { id: user.id, role };
	}
}
