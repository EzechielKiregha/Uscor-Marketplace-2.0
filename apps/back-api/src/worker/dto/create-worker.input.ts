import { InputType, Int, Field, registerEnumType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export enum WorkerRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  MANAGER = 'MANAGER',
  FREELANCER = 'FREELANCER'
}

registerEnumType(WorkerRole, {name : "WorkerRole"})

@InputType()
export class CreateWorkerInput {
  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fullName?: string;

  @Field( () => WorkerRole)
  @IsEnum(WorkerRole)
  role: WorkerRole;

  @Field()
  @IsString()
  password: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  isVerified: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  businessId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  kycId?: string;
}
