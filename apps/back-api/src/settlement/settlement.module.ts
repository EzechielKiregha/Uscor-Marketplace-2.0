import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { SettlementResolver } from "./settlement.resolver";
import { SettlementService } from "./settlement.service";

@Module({
	providers: [SettlementResolver, SettlementService, PrismaService],
	imports: [PrismaModule],
	exports: [SettlementService],
})
export class SettlementModule {}
