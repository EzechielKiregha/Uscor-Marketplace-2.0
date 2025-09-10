import {
  InputType,
  Int,
  Field,
} from '@nestjs/graphql'
import { BusinessEntity } from 'src/business/entities/business.entity'
import { ClientEntity } from 'src/client/entities/client.entity'
import { FreelanceServiceEntity } from 'src/freelance-service/entities/freelance-service.entity'
import { ProductEntity } from 'src/product/entities/product.entity'
import { StoreEntity } from 'src/store/entities/store.entity'
import { WorkerEntity } from 'src/worker/entities/worker.entity'

@InputType()
export class CreateMediaInput {
  @Field(() => String)
  url: string

  @Field(() => String)
  type: string

  @Field(() => ProductEntity)
  product?: ProductEntity

  @Field(() => String, { nullable: true })
  productId?: string

  @Field(() => String, { nullable: true })
  businessId?: string

  @Field(() => BusinessEntity, { nullable: true })
  business?: BusinessEntity

  @Field(() => String, { nullable: true })
  storeId?: string

  @Field(() => StoreEntity, { nullable: true })
  store?: StoreEntity

  @Field(() => String, { nullable: true })
  clientId?: string

  @Field(() => ClientEntity, { nullable: true })
  client?: ClientEntity

  @Field(() => WorkerEntity, { nullable: true })
  worker?: WorkerEntity

  @Field(() => String, { nullable: true })
  workerId?: string

  @Field(() => String, { nullable: true })
  serviceId?: string

  @Field(() => FreelanceServiceEntity, {
    nullable: true,
  })
  service?: FreelanceServiceEntity
}
