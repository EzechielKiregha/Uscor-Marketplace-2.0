import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { ClientResolver } from "./client.resolver";
import { ClientService } from "./client.service";

@Module({
	providers: [ClientResolver, ClientService, PrismaService],
	imports: [PrismaModule],
})
export class ClientModule {}
