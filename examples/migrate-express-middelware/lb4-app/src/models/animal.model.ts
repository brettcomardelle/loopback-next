import {Entity, model, property} from '@loopback/repository';

@model()
export class Animal extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;


  constructor(data?: Partial<Animal>) {
    super(data);
  }
}

export interface AnimalRelations {
  // describe navigational properties here
}

export type AnimalWithRelations = Animal & AnimalRelations;
