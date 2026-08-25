import { ObjectShape, ValidationError, object } from 'yup';

export type YupError = {
  message: string;
  param: string | undefined;
};

const compileSchema = (schema: ObjectShape) => object().shape(schema);

export class YupErrorHandler {
  // Keyed by the schema object's identity: object().shape(schema) rebuilds
  // the whole ObjectSchema (fields, dependency order) on every call, which is
  // wasted work whenever the same schema instance is reused across calls, as
  // static class schemas are. A schema shape built fresh per call simply
  // never hits the cache, so this stays correct either way.
  private static schemaCache = new WeakMap<
    ObjectShape,
    ReturnType<typeof compileSchema>
  >();

  private errors: YupError[] = [];

  addError(error: YupError) {
    this.errors.push(error);
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): YupError[] {
    return this.errors;
  }

  static RemoveDuplicatedErrors(errors: YupError[]): YupError[] {
    if (!errors.length) return errors;

    const uniqueKeys = new Set();
    const uniqueErrors = [];

    for (const error of errors) {
      const key = error.param + error.message;

      if (uniqueKeys.has(key)) continue;

      uniqueKeys.add(key);
      uniqueErrors.push(error);
    }

    return uniqueErrors;
  }

  protected validateSchema<T>(schema: ObjectShape, data: T): void {
    try {
      let compiledSchema = YupErrorHandler.schemaCache.get(schema);
      if (!compiledSchema) {
        compiledSchema = compileSchema(schema);
        YupErrorHandler.schemaCache.set(schema, compiledSchema);
      }

      compiledSchema.validateSync(data, {
        abortEarly: false
      });
    } catch (error) {
      if (!(error instanceof ValidationError)) return;

      error.inner.forEach(({ path, message }) =>
        this.addError({ param: path, message })
      );
    }
  }
}
