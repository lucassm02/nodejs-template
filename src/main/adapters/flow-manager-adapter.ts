import { convertToLowerCase, getIn } from '@/util/object';

export type adapterOptions = {
  target?: {
    body?: string;
    params?: string;
    query?: string;
    headers?: string;
    [key: string]: string | undefined;
  };
  expected?: { [key: string]: any };
  handle: Function;
}[];

const checkIfTestsPass = (checkArray: any[]) => {
  const findNonComplianceResult = checkArray.find((value) => value === false);
  return findNonComplianceResult !== false;
};

const filterHttpRequestByTarget = (
  request: { [key: string]: any },
  target: { [key: string]: any }
) =>
  Object.keys(target).reduce((accumulator, key) => {
    const [rootKey] = key.split('.');

    return {
      ...accumulator,
      [rootKey]: request?.[rootKey],
    };
  }, {});

const convertTargetForLowerCaseEntities = (target: { [key: string]: any }) =>
  Object.entries(target).map(([key, value]) => [
    String(key).toLocaleLowerCase(),
    String(value).toLocaleLowerCase(),
  ]);

export const flowManagerAdapter =
  (options: adapterOptions) =>
  (...middlewareParams: any) => {
    const rawHttpRequest = middlewareParams?.[0];

    for (const option of options) {
      if (!option.target) return option.handle(...middlewareParams);

      const filteredHttRequest = filterHttpRequestByTarget(
        rawHttpRequest,
        option.target
      );

      const httpRequestToLowerCaseKeys = convertToLowerCase(filteredHttRequest);

      const targetEntries = convertTargetForLowerCaseEntities(option.target);

      const expectedToLowerCaseKeys = convertToLowerCase(option.expected);

      const testsResults = targetEntries.map((entries) => {
        const [targetRequestKey, targetRequestValue] = entries;

        if (Array.isArray(targetRequestValue)) {
          const conditionResultExtractedFromArray = (() => {
            const testsResult = targetRequestValue.map((value) => {
              const keyPath = `${targetRequestKey}.${value}`;

              const requestValue =
                getIn(httpRequestToLowerCaseKeys, keyPath) ?? undefined;

              if (!option.expected && requestValue) return true;

              const expectedValue = expectedToLowerCaseKeys?.[value];

              return requestValue === expectedValue;
            });

            return checkIfTestsPass(testsResult);
          })();

          return conditionResultExtractedFromArray;
        }

        const keyPath = `${targetRequestKey}.${targetRequestValue}`;

        const requestValue =
          getIn(httpRequestToLowerCaseKeys, keyPath) ?? undefined;

        if (typeof requestValue !== 'boolean' && !requestValue) return false;

        if (!option.expected) return true;

        const expectedValue = expectedToLowerCaseKeys?.[targetRequestValue];

        const testResult = requestValue === expectedValue;

        return testResult;
      });

      const passedTheTest = checkIfTestsPass(testsResults);

      if (passedTheTest) return option.handle(...middlewareParams);
    }
  };
