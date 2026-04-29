import { Module } from "@nestjs/common";
import { ReferralResolver } from "./referral.resolver";
import { ReferralService } from "./referral.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";

@Module({
	providers: [ReferralResolver, ReferralService, PrismaService],
	imports: [PrismaModule]
})
export class ReferralModule {}
