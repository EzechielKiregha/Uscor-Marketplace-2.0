import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditResolver } from "./audit.resolver";
import { AuditService } from "./audit.service";

@Module({
	providers: [AuditResolver, AuditService, PrismaService],
})
export class AuditModule {}
