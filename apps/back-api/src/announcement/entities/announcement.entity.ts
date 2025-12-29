import { ObjectType, Field, Int } from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'

@ObjectType()
export class AnnouncementEntity {
  @Field() id: string
  @Field() title: string
  @Field() content: string
  @Field({ nullable: true }) type?: string
  @Field({ nullable: true }) priority?: string
  @Field() status: string
  @Field({ nullable: true }) scheduledFor?: string
  @Field({ nullable: true }) sentAt?: Date
  @Field(() => GraphQLJSON, { nullable: true }) targetUsers?: any
  @Field(() => Int) readCount: number
  @Field(() => Int, { nullable: true }) totalRecipients?: number
  @Field() createdAt: Date
  @Field() updatedAt: Date
}

@ObjectType()
export class PaginatedAnnouncementsResponse {
  @Field(() => [AnnouncementEntity]) items: AnnouncementEntity[]
  @Field(() => Int) total: number
  @Field(() => Int) page: number
  @Field(() => Int) limit: number
}
