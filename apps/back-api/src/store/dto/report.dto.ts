import { Field, ID, InputType, registerEnumType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsOptional, IsString } from "class-validator";

export enum ReportType {
    STORE_OVERVIEW = "STORE_OVERVIEW",
    SALES_PERFORMANCE = "SALES_PERFORMANCE",
    WORKER_PERFORMANCE = "WORKER_PERFORMANCE",
    INVENTORY = "INVENTORY",
    CLIENT_LOYALTY = "CLIENT_LOYALTY",
    SHIFTS = "SHIFTS",
    ORDERS_TRANSFERS = "ORDERS_TRANSFERS",
}
registerEnumType(ReportType, { name: "ReportType" });

@InputType()
export class GenerateStoreReportInput {
    @Field(() => ID)
    @IsString()
    storeId!: string;

    @Field(() => ReportType)
    @IsEnum(ReportType)
    reportType!: ReportType;

    @Field({ defaultValue: "month" })
    @IsString()
    period!: string;

    @Field({ nullable: true })
    @Type(() => Date)
    @IsOptional()
    @IsDate()
    startDate?: Date;

    @Field({ nullable: true })
    @Type(() => Date)
    @IsOptional()
    @IsDate()
    endDate?: Date;
}
