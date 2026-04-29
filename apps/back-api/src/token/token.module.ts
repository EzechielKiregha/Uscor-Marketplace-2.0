import { Module } from "@nestjs/common";
import { TokenResolver } from "./token.resolver";
import { TokenService } from "./token.service";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	providers: [TokenResolver, TokenService, PrismaService],
		imports: [PrismaModule]
})
export class TokenModule {}
