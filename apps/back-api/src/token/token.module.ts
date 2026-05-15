import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { TokenResolver } from "./token.resolver";
import { TokenService } from "./token.service";

@Module({
	providers: [TokenResolver, TokenService, PrismaService],
	imports: [PrismaModule],
})
export class TokenModule {}
