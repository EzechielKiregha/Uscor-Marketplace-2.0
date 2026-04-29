import { Module } from "@nestjs/common";
import { ReviewResolver } from "./review.resolver";
import { ReviewService } from "./review.service";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	providers: [ReviewResolver, ReviewService, PrismaService],
	imports: [PrismaModule]
})
export class ReviewModule {}
