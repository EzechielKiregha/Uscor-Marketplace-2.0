import { Module } from "@nestjs/common";
import { BusinessModule } from "../business/business.module";
import { BusinessService } from "../business/business.service";
import { ClientModule } from "../client/client.module";
import { ClientService } from "../client/client.service";
import { PrismaService } from "../prisma/prisma.service";
import { LoyaltyResolver } from "./loyalty-program.resolver";
import { LoyaltyService } from "./loyalty-program.service";

// Module
@Module({
	providers: [
		LoyaltyResolver,
		LoyaltyService,
		PrismaService,
		BusinessService,
		ClientService,
	],
	imports: [BusinessModule, ClientModule],
})
export class LoyaltyProgramModule {}
