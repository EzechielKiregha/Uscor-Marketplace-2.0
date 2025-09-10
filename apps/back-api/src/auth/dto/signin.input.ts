import { InputType, Field } from '@nestjs/graphql'
import {
  IsEmail,
  IsString,
} from 'class-validator'

@InputType()
export class SignInInput {
  @Field()
  @IsEmail()
  email: string

  @Field()
  @IsString()
  password: string
}
