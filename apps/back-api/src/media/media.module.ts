import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { MediaResolver } from "./media.resolver";
import { MediaService } from "./media.service";

@Module({
	providers: [MediaResolver, MediaService, PrismaService],
	imports: [PrismaModule],
	exports: [MediaService],
})
export class MediaModule {}
