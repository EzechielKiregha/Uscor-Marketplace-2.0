import { ObjectType, Field, registerEnumType } from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'

enum AdminRole {
  SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
  SUPPORT = "SUPPORT"
}

registerEnumType(AdminRole, {
  name: 'AdminRole',
  description: 'Roles assigned to admin users',
})
@ObjectType()
export class Admin {
  @Field() id: string
  @Field() email: string
  @Field({ nullable: true }) fullName?: string
  @Field({ nullable: true }) phone?: string
  @Field({ nullable: true }) avatar?: string
  @Field(() => AdminRole) role: AdminRole
  @Field() isActive: boolean
  @Field({ nullable: true }) lastLogin?: Date
  @Field(() => GraphQLJSON, { nullable: true }) permissions?: any
  @Field() createdAt: Date
  @Field() updatedAt: Date
}