import { ExampleModel } from '@/domain/models';

type Model = {
  exampleId: string;
  externalId: string;
  value: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};

export const ModelMock: Model = {
  exampleId: 'any_example_id',
  externalId: 'any_external_id',
  value: 'any_value',
  description: 'any_description',
  createdAt: 'any_created_at',
  updatedAt: 'any_updated_at',
  deletedAt: 'any_deleted_at'
};

export const exampleModelMock: ExampleModel = new ExampleModel({
  createdAt: new Date('2023-01-01'),
  description: 'any_description',
  exampleId: 'any_example_id',
  externalId: 'any_external_id',
  value: 1,
  deletedAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01')
});
