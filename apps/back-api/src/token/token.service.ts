import { Injectable } from "@nestjs/common";
import type { CreateTokenInput } from "./dto/create-token.input";
import type { UpdateTokenInput } from "./dto/update-token.input";

@Injectable()
export class TokenService {
	create(_createTokenInput: CreateTokenInput) {
		return "This action adds a new token";
	}

	findAll() {
		return `This action returns all token`;
	}

	findOne(id: number) {
		return `This action returns a #${id} token`;
	}

	update(id: number, _updateTokenInput: UpdateTokenInput) {
		return `This action updates a #${id} token`;
	}

	remove(id: number) {
		return `This action removes a #${id} token`;
	}
}
