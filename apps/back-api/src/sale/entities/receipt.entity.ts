import { ObjectType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';
import { SaleStatus } from 'src/generated/prisma/enums';

// Enums
registerEnumType(SaleStatus, { name: 'SaleStatus' });

@ObjectType()
export class ReceiptEntity {
  @Field()
  filePath: string;

  @Field({ nullable: true })
  emailSent?: boolean;
}

