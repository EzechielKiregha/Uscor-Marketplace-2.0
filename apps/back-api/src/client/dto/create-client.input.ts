import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, IsBoolean } from 'class-validator';

@InputType()
export class CreateClientInput {
  @Field()
  @IsString()
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fullName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  phone?: string;

  @Field()
  @IsString()
  password: string;

  @Field()
  @IsBoolean()
  isVerified: boolean;
}
