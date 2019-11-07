import {DefaultCrudRepository} from '@loopback/repository';
import {Animal, AnimalRelations} from '../models';
import {MemoryDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AnimalRepository extends DefaultCrudRepository<
  Animal,
  typeof Animal.prototype.id,
  AnimalRelations
> {
  constructor(
    @inject('datasources.memory') dataSource: MemoryDataSource,
  ) {
    super(Animal, dataSource);
  }
}
