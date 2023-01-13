import { spawn } from 'child_process';
import { F_OK } from 'node:fs';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DEFAULT_SECRET_VALUES = [
  'ENCRYPTION_KEY',
  'ENCRYPTION_IV',
  'DB_PASSWORD',
  'DB_USERNAME',
  'RABBIT_USER',
  'RABBIT_PASSWORD',
  'MONGO_USER',
  'MONGO_PASSWORD',
  'ELASTICSEARCH_USERNAME',
  'ELASTICSEARCH_PASSWORD',
  'APM_SECRET_TOKEN',
];

export const ENVIRONMENT_VALUES_TO_IGNORE = ['SONAR_TOKEN'];

export const ENVIRONMENT_VALUES = {
  PRODUCTION: {
    HELM_FILE_NAME: 'production-values',
    ENV_FILE: '.env.production',
  },
  HOMOLOGATION: {
    HELM_FILE_NAME: 'homologation-values',
    ENV_FILE: '.env.homologation',
  },
  DEVELOPMENT: {
    HELM_FILE_NAME: 'development-values',
    ENV_FILE: '.env.development',
  },
};

export const writeHelmValuesFile = async (fileName, content = '') => {
  const folderPath = resolve(__dirname, '..', '..', 'helm');
  const filePath = resolve(folderPath, fileName);

  try {
    await access(folderPath, F_OK);
  } catch (error) {
    await mkdir(folderPath);
  }

  await writeFile(filePath, content);
};

export const writeHelmEnvironmentConfigFile = async (
  fileName,
  environment,
  content = ''
) => {
  const folderPath = resolve(
    __dirname,
    '..',
    '..',
    'helm',
    environment.toLowerCase()
  );
  const filePath = resolve(folderPath, fileName);

  try {
    await access(folderPath, F_OK);
  } catch (error) {
    await mkdir(folderPath);
  }

  await writeFile(filePath, `---\n${content}`);
};

export const getEnvValues = async (fileName) => {
  const path = resolve(__dirname, '..', '..', fileName);
  const fileContent = await readFile(path, 'utf-8');
  const lines = fileContent.split('\n');

  const entries = lines
    .map((item) => {
      const line = item.trim();
      if (!item.includes('=')) return;
      const [key, value] = line.split('=');
      return [key, value];
    })
    .filter(Boolean);

  return Object.fromEntries(entries);
};

export const extractSecretsAndConfigMapsFromEnv = (env, secretKeys = []) => {
  const envEntriesFiltered = Object.entries(env).filter(
    ([key]) => !ENVIRONMENT_VALUES_TO_IGNORE.includes(key)
  );

  const allSecretKeys = [...new Set([...secretKeys, ...DEFAULT_SECRET_VALUES])];

  const secretEntries = envEntriesFiltered
    .filter(([key]) => allSecretKeys.includes(key))
    .map(([key, value]) => {
      return [key, Buffer.from(value).toString('base64')];
    });

  const configMapEntries = envEntriesFiltered.filter(
    ([key]) => !allSecretKeys.includes(key)
  );

  const secret = Object.fromEntries(secretEntries);
  const configMap = Object.fromEntries(configMapEntries);

  return { secret, configMap };
};

export const generateHelmRequiredVariablesFromEnv = (env, appName) => {
  return Object.entries(env).map(([key]) => {
    return { name: key, refName: appName };
  });
};

export const generateEnvironmentConfig = (data, appName, kind) => {
  const type = kind === 'Secret' ? 'Opaque' : undefined;

  return {
    apiVersion: 'v1',
    kind,
    type,
    metadata: {
      name: appName,
    },
    data,
  };
};

export const getGitlabContainerRegisterUrl = async () => {
  const lines = await new Promise(function (resolve, reject) {
    const chunks = [];
    const args = ['config', '--get', 'remote.origin.url'];
    const process = spawn('git', args);
    process.stdout.on('data', (data) => {
      chunks.push(data.toString());
    });
    process.stdout.on('end', () => {
      const newLines = chunks.map((item) => item.replace(/\n/g, ''));
      resolve(newLines);
    });
    process.stdout.on('error', (err) => {
      reject(err);
    });
  });

  const gitLabRegisterBaseUrl = 'registry.gitlab.com';

  const [, , gitlabGroup, gitLabProject] = lines[0]
    .replace('.git', '')
    .split('/')
    .filter((str) => str !== '');

  return [gitLabRegisterBaseUrl, gitlabGroup, gitLabProject].join('/');
};
