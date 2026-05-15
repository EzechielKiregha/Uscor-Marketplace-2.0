import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { RepostedProductResolver } from "./reposted-product.resolver";
import { RepostedProductService } from "./reposted-product.service";

// Module
@Module({
	providers: [RepostedProductResolver, RepostedProductService, PrismaService],
	imports: [PrismaModule],
})
export class RepostedProductModule {}
