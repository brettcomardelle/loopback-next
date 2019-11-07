import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {Animal} from '../models';
import {AnimalRepository} from '../repositories';

export class AnimalController {
  constructor(
    @repository(AnimalRepository)
    public animalRepository : AnimalRepository,
  ) {}

  @post('/animals', {
    responses: {
      '200': {
        description: 'Animal model instance',
        content: {'application/json': {schema: getModelSchemaRef(Animal)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Animal, {
            title: 'NewAnimal',
            exclude: ['id'],
          }),
        },
      },
    })
    animal: Omit<Animal, 'id'>,
  ): Promise<Animal> {
    return this.animalRepository.create(animal);
  }

  @get('/animals/count', {
    responses: {
      '200': {
        description: 'Animal model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Animal)) where?: Where<Animal>,
  ): Promise<Count> {
    return this.animalRepository.count(where);
  }

  @get('/animals', {
    responses: {
      '200': {
        description: 'Array of Animal model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Animal)},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Animal)) filter?: Filter<Animal>,
  ): Promise<Animal[]> {
    return this.animalRepository.find(filter);
  }

  @patch('/animals', {
    responses: {
      '200': {
        description: 'Animal PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Animal, {partial: true}),
        },
      },
    })
    animal: Animal,
    @param.query.object('where', getWhereSchemaFor(Animal)) where?: Where<Animal>,
  ): Promise<Count> {
    return this.animalRepository.updateAll(animal, where);
  }

  @get('/animals/{id}', {
    responses: {
      '200': {
        description: 'Animal model instance',
        content: {'application/json': {schema: getModelSchemaRef(Animal)}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Animal> {
    return this.animalRepository.findById(id);
  }

  @patch('/animals/{id}', {
    responses: {
      '204': {
        description: 'Animal PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Animal, {partial: true}),
        },
      },
    })
    animal: Animal,
  ): Promise<void> {
    await this.animalRepository.updateById(id, animal);
  }

  @put('/animals/{id}', {
    responses: {
      '204': {
        description: 'Animal PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() animal: Animal,
  ): Promise<void> {
    await this.animalRepository.replaceById(id, animal);
  }

  @del('/animals/{id}', {
    responses: {
      '204': {
        description: 'Animal DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.animalRepository.deleteById(id);
  }
}
