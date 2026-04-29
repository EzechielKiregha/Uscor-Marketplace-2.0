import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ClientResolver } from "./client.resolver";
import { ClientService } from "./client.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	providers: [ClientResolver, ClientService, PrismaService],
	imports: [PrismaModule]
})
export class ClientModule {}
