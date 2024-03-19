import { ObjectShape, ValidationError, object } from 'yup';

export type YupError = {
  message: string;
  param: string | undefined;
};

export class YupErrorHandler {
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
      object().shape(schema).validateSync(data, {
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
