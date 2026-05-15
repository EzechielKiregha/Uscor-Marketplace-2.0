import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { ReferralResolver } from "./referral.resolver";
import { ReferralService } from "./referral.service";

@Module({
	providers: [ReferralResolver, ReferralService, PrismaService],
	imports: [PrismaModule],
})
export class ReferralModule {}
