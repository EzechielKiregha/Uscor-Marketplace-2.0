import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsEmail, IsOptional, IsString } from "class-validator";

@InputType()
export class AddWorkerToStoreInput {

    @Field(() => Boolean, { nullable: true })
    @IsOptional()
    @IsBoolean()
    createNewWorker?: boolean;

    @Field()
    @IsEmail()
    email: string;
    
    @Field()
    @IsString()
    storeId: string;

}
