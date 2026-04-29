import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global() // This makes the PrismaService available globally, so you don't need to import PrismaModule in every module that uses PrismaService
@Module({
	providers: [PrismaService],
})
export class PrismaModule {}
