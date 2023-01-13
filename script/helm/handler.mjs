/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import Yaml from 'yaml';

import packageProps from '../../package.json' assert { type: 'json' };
import manifestTemplate from './manifest.json' assert { type: 'json' };
import {
  ENVIRONMENT_VALUES,
  writeHelmValuesFile,
  writeHelmEnvironmentConfigFile,
  generateEnvironmentConfig,
  getEnvValues,
  extractSecretsAndConfigMapsFromEnv,
  generateHelmRequiredVariablesFromEnv,
  getGitlabContainerRegisterUrl,
  makeIngressHosts,
  getProjectRoutes,
} from './util.mjs';

export const handler = async (environment, scanRoutes) => {
  const environmentToUpperCase = environment.toUpperCase();

  const allowedEnvironments = ['PRODUCTION', 'HOMOLOGATION', 'DEVELOPMENT'];

  if (!allowedEnvironments.includes(environmentToUpperCase)) {
    console.error('Invalid environment');
    return process.exit(1);
  }

  const helmFileName = `${ENVIRONMENT_VALUES?.[environmentToUpperCase]?.HELM_FILE_NAME}.yaml`;

  const envValues = await getEnvValues(
    ENVIRONMENT_VALUES?.[environmentToUpperCase]?.ENV_FILE
  );
  const { secret, configMap } = extractSecretsAndConfigMapsFromEnv(envValues);

  const repositoryUrl = await getGitlabContainerRegisterUrl();

  const manifest = manifestTemplate;

  manifest.configs = generateHelmRequiredVariablesFromEnv(
    configMap,
    packageProps.name
  );

  manifest.secrets = generateHelmRequiredVariablesFromEnv(
    secret,
    packageProps.name
  );

  const k8sName = packageProps.name.replace(/-/g, '');

  manifest.image.repository = repositoryUrl;
  manifest.fullnameOverride = k8sName;
  manifest.nameOverride = k8sName;

  manifest.autoscaling =
    ENVIRONMENT_VALUES?.[environmentToUpperCase].AUTOSCALING;
  manifest.resources = ENVIRONMENT_VALUES?.[environmentToUpperCase].RESOURCES;

  manifest.ingress.enabled = !!scanRoutes;

  if (scanRoutes) {
    const routes = await getProjectRoutes();
    manifest.ingress.hosts = makeIngressHosts(routes, environment);
  }

  console.log(envValues);

  if (
    envValues.SERVER_BASE_URI &&
    envValues.SERVER_ENABLED &&
    envValues.SERVER_ENABLED.toUpperCase() === 'TRUE' &&
    envValues.SERVER_BASE_URI !== ''
  ) {
    manifest.check.readiness.enabled = envValues.SERVER_ENABLED === 'true';
    manifest.check.readiness.path = `${envValues.SERVER_BASE_URI}/health`;
  }

  const manifestToYaml = Yaml.stringify(manifest);

  const configMapToJson = generateEnvironmentConfig(
    configMap,
    packageProps.name,
    'ConfigMap'
  );
  const secretToJson = generateEnvironmentConfig(
    secret,
    packageProps.name,
    'Secret'
  );

  const configMapToYaml = Yaml.stringify(configMapToJson);
  const secretMapToYaml = Yaml.stringify(secretToJson);

  await writeHelmValuesFile(helmFileName, manifestToYaml);

  await writeHelmEnvironmentConfigFile(
    'config-map.yaml',
    environment,
    configMapToYaml
  );

  await writeHelmEnvironmentConfigFile(
    'secret.yaml',
    environment,
    secretMapToYaml
  );
};
