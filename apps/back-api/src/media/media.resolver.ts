import { Resolver } from "@nestjs/graphql";
import { MediaEntity } from "./entities/media.entity";
import { MediaService } from "./media.service";

@Resolver(() => MediaEntity)
export class MediaResolver {
	constructor(readonly _mediaService: MediaService) {}
}
