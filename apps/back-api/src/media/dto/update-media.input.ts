import { ProductEntity } from '../../product/entities/product.entity'
import { CreateMediaInput } from './create-media.input'
import {
  InputType,
  Field,
  Int,
  PartialType,
} from '@nestjs/graphql'
import { BusinessEntity } from '../../business/entities/business.entity'
import { ClientEntity } from '../../client/entities/client.entity'
import { WorkerEntity } from '../../worker/entities/worker.entity'
import { FreelanceServiceEntity } from '../../freelance-service/entities/freelance-service.entity'
import { StoreEntity } from '../../store/entities/store.entity'

@InputType()
export class UpdateMediaInput extends PartialType(
  CreateMediaInput,
) {
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
