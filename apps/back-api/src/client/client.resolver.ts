import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { ClientService } from './client.service';
import { ClientEntity } from './entities/client.entity';
import { CreateClientInput } from './dto/create-client.input';
import { UpdateClientInput } from './dto/update-client.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Resolver(() => ClientEntity)
export class ClientResolver {
  constructor(private readonly clientService: ClientService) {}

  @Mutation(() => ClientEntity, { description: 'Creates a new client with hashed password.' })
  async createClient(@Args('createClientInput') createClientInput: CreateClientInput) {
    return this.clientService.create(createClientInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business') // Allow clients to view their own data, businesses to view clients
  @Query(() => [ClientEntity], { name: 'clients', description: 'Retrieves all clients with their relations.' })
  async getClients(@Context() context) {
    const user = context.req.user;
    console.log('Authenticated user:', user); // Debugging
    return this.clientService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Query(() => ClientEntity, { name: 'client', description: 'Retrieves a single client by ID.' })
  async getClient(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    if (user.role === 'client' && user.id !== id) {
      throw new Error('Clients can only access their own data');
    }
    return this.clientService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => ClientEntity, { description: 'Updates a client’s details.' })
  async updateClient(
    @Args('id', { type: () => String }) id: string,
    @Args('updateClientInput') updateClientInput: UpdateClientInput,
    @Context() context,
  ) {
    const user = context.req.user;
    if (user.id !== id) {
      throw new Error('Clients can only update their own data');
    }
    return this.clientService.update(id, updateClientInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => ClientEntity, { description: 'Deletes a client.' })
  async deleteClient(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    if (user.id !== id) {
      throw new Error('Clients can only delete their own account');
    }
    return this.clientService.remove(id);
  }
}
