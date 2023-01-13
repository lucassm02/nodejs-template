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
} from './util.mjs';

export const handler = async (environment) => {
  const helmFileName = `${
    ENVIRONMENT_VALUES?.[environment.toUpperCase()]?.HELM_FILE_NAME
  }.yaml`;

  const envValues = await getEnvValues(`.env.${environment.toLowerCase()}`);
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

  manifest.fullnameOverride = k8sName;
  manifest.nameOverride = k8sName;

  manifest.ingress.enabled = false;
  manifest.ingress.hosts = [];
  manifest.image.repository = repositoryUrl;

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
