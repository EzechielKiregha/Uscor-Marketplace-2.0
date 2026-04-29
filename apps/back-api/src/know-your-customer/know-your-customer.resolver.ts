import { Resolver } from "@nestjs/graphql";
import { KnowYourCustomerEntity } from "./entities/know-your-customer.entity";
import type { KnowYourCustomerService } from "./know-your-customer.service";

@Resolver(() => KnowYourCustomerEntity)
export class KnowYourCustomerResolver {
	constructor(readonly _knowYourCustomerService: KnowYourCustomerService) {}
}
