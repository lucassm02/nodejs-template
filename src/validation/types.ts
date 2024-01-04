import { AnyObject, ObjectSchema } from 'yup';

export type ShapeToSchema<T extends AnyObject> = ObjectSchema<T>;
