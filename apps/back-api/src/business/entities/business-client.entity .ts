// src/business/dto/dashboard-client.dto.ts
import {
  ObjectType,
  Field,
  ID,
} from '@nestjs/graphql'
import { ApiProperty } from '@nestjs/swagger'

@ObjectType()
export class DashboardClientDto {
  @ApiProperty()
  @Field(() => ID)
  id: string

  @ApiProperty()
  @Field()
  fullName: string
}
