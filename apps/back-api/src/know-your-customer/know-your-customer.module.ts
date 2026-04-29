import { Module } from "@nestjs/common";
import { KnowYourCustomerResolver } from "./know-your-customer.resolver";
import { KnowYourCustomerService } from "./know-your-customer.service";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	providers: [KnowYourCustomerResolver, KnowYourCustomerService, PrismaService],
		imports: [PrismaModule]
})
export class KnowYourCustomerModule {}
