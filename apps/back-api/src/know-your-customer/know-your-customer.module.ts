import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { KnowYourCustomerResolver } from "./know-your-customer.resolver";
import { KnowYourCustomerService } from "./know-your-customer.service";

@Module({
	providers: [KnowYourCustomerResolver, KnowYourCustomerService, PrismaService],
	imports: [PrismaModule],
})
export class KnowYourCustomerModule {}
