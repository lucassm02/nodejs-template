import * as yup from 'yup';

import { YupErrorHandler } from '@/domain/models';

type Data = {
  exampleId: string;
  externalId: string;
  value: number;
  description: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export class ExampleModel extends YupErrorHandler {
  private data!: Data;

  constructor(data: Data) {
    super();
    this.data = data;
    this.validate();
  }

  get payload(): Data {
    return this.data;
  }

  set exampleId(value: string) {
    this.data.exampleId = value;
    this.validate();
  }

  get exampleId(): string {
    return this.data.exampleId;
  }

  set externalId(value: string) {
    this.data.externalId = value;
    this.validate();
  }

  get externalId(): string {
    return this.data.externalId;
  }

  set value(value: number) {
    this.data.value = value;
    this.validate();
  }

  get value(): number {
    return this.data.value;
  }

  set description(value: string) {
    this.data.description = value;
    this.validate();
  }

  get description(): string {
    return this.data.description;
  }

  set createdAt(value: Date) {
    this.data.createdAt = value;
    this.validate();
  }

  get createdAt(): Date {
    return this.data.createdAt;
  }

  set updatedAt(value: Date | undefined) {
    this.data.updatedAt = value;
    this.validate();
  }

  get updatedAt(): Date | undefined {
    return this.data.updatedAt;
  }

  set deletedAt(value: Date | undefined) {
    this.data.deletedAt = value;
    this.validate();
  }

  get deletedAt(): Date | undefined {
    return this.data.deletedAt;
  }

  #schema = {
    exampleId: yup.string().required('O campo "exampleId" é obrigatório.'),
    externalId: yup.string().required('O campo "externalId" é obrigatório.'),
    value: yup.number().required('O campo "value" é obrigatório.'),
    description: yup.string().required('O campo "description" é obrigatório.'),
    createdAt: yup.date().required('O campo "createdAt" é obrigatório.'),
    updatedAt: yup.date().optional(),
    deletedAt: yup.date().optional()
  };

  private validate() {
    this.validateSchema(this.#schema, this.data);
  }
}

export const makeExampleModel = (data: Data) => new ExampleModel(data);

export type Example = ExampleModel;
