import { APM } from '@/util';
import { ElasticAPM } from '@/util/observability/apm/elastic-apm';

describe('Elastic APM', () => {
  it('should return null apm when APM is not ENABLED', () => {
    APM.ENABLED = false;

    const elasticApm = new ElasticAPM();

    expect(elasticApm.getAPM()).toBeFalsy();
  });

  it('should return an apm when APM is ENABLED', () => {
    APM.ENABLED = true;

    const elasticApm = new ElasticAPM();

    const apm = elasticApm.getAPM();
    expect(apm).toBeTruthy();
  });
});
