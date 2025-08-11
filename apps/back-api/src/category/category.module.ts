import { Module } from '@nestjs/common';
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';


@InputType()
export class UpdateCategoryInput {
  @Field(() => String)
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@Module({
  providers: [CategoryResolver, CategoryService, PrismaService],
})
export class CategoryModule {}
