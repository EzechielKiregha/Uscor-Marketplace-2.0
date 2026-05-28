import { Field, ID, ObjectType } from "@nestjs/graphql";
import { ReportType } from "../dto/report.dto";

@ObjectType()
export class StoreReportResponse {
    @Field() reportUrl!: string;
    @Field() fileName!: string;
    @Field(() => ID) mediaId!: string;
}

@ObjectType()
export class ReportHistoryEntity {
    @Field(() => ID) id!: string;
    @Field(() => ReportType) reportType!: ReportType;
    @Field() period!: string;
    @Field() generatedAt!: Date;
    @Field() url!: string;
    @Field() fileName!: string;
    @Field() storeId!: string;
}
