import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SyncResultItem {
	@Field()
	localId: string;

	@Field({ nullable: true })
	serverId?: string;

	@Field()
	status: string; // SYNCED | CONFLICT | FAILED | DUPLICATE

	@Field({ nullable: true })
	error?: string;

	@Field({ nullable: true })
	conflictDetails?: string;
}

@ObjectType()
export class SyncResult {
	@Field(() => Int)
	synced: number;

	@Field(() => Int)
	failed: number;

	@Field(() => Int)
	conflicts: number;

	@Field(() => Int)
	duplicates: number;

	@Field(() => [SyncResultItem])
	results: SyncResultItem[];
}
