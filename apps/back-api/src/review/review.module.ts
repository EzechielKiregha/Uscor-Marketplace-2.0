import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { ReviewResolver } from "./review.resolver";
import { ReviewService } from "./review.service";

@Module({
	providers: [ReviewResolver, ReviewService, PrismaService],
	imports: [PrismaModule],
})
export class ReviewModule {}
