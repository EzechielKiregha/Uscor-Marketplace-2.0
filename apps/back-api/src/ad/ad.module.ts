import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { AdResolver } from "./ad.resolver";
import { AdService } from "./ad.service";

@Module({
	providers: [AdResolver, AdService, PrismaService],
	imports: [PrismaModule],
})
export class AdModule {}
