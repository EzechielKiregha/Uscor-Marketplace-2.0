import { Field, ObjectType } from "@nestjs/graphql";
import { FreelanceServiceEntity } from "../../freelance-service/entities/freelance-service.entity";
import { ProductEntity } from "../../product/entities/product.entity";

@ObjectType()
export class SearchMarketplaceResponse {
	@Field(() => [ProductEntity])
	products: ProductEntity[];

	@Field(() => [FreelanceServiceEntity])
	services: FreelanceServiceEntity[];
}
