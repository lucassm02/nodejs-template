/* eslint-disable no-console */
import { spawn } from 'child_process';
import { F_OK } from 'node:fs';
import { access, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
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
    REPLICA_COUNT: 2,
    INGRESS_HOSTS: ['api.pagtel.com.br'],
    RESOURCES: {
      requests: {
        cpu: '100m',
        memory: '128Mi',
      },
      limits: {
        cpu: '100m',
        memory: '150Mi',
      },
    },
    AUTOSCALING: {
      enabled: true,
      minReplicas: 2,
      maxReplicas: 5,
      targetCPUUtilizationPercentage: 80,
      targetMemoryUtilizationPercentage: 80,
    },
  },
  HOMOLOGATION: {
    HELM_FILE_NAME: 'homologation-values',
    ENV_FILE: '.env.homologation',
    REPLICA_COUNT: 1,
    INGRESS_HOSTS: ['homologation.pagtel.com.br'],
    RESOURCES: {
      requests: {
        cpu: '100m',
        memory: '128Mi',
      },
      limits: {
        cpu: '100m',
        memory: '150Mi',
      },
    },
    AUTOSCALING: {
      enabled: true,
      minReplicas: 1,
      maxReplicas: 2,
      targetCPUUtilizationPercentage: 90,
      targetMemoryUtilizationPercentage: 90,
    },
  },
  DEVELOPMENT: {
    HELM_FILE_NAME: 'development-values',
    ENV_FILE: '.env.development',
    REPLICA_COUNT: 1,
    INGRESS_HOSTS: ['development.pagtel.com.br'],
    RESOURCES: {
      requests: {
        cpu: '100m',
        memory: '128Mi',
      },
      limits: {
        cpu: '100m',
        memory: '150Mi',
      },
    },
    AUTOSCALING: {
      enabled: true,
      minReplicas: 1,
      maxReplicas: 2,
      targetCPUUtilizationPercentage: 90,
      targetMemoryUtilizationPercentage: 90,
    },
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
    'environment',
    environment.toLowerCase()
  );
  const filePath = resolve(folderPath, fileName);

  try {
    await access(folderPath, F_OK);
  } catch (error) {
    await mkdir(folderPath, { recursive: true });
  }

  await writeFile(filePath, `---\n${content}`);
};

export const getEnvValues = async (fileName) => {
  try {
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
  } catch (error) {
    console.error(`${fileName} not found`);
    return process.exit(1);
  }
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

  const [, , ...uri] = lines[0]
    .replace('.git', '')
    .split('/')
    .filter((str) => str !== '');

  return [gitLabRegisterBaseUrl, ...uri].join('/');
};

export const getProjectRoutes = async () => {
  const PATHS_TO_IGNORE = ['/health', '/examples'];
  const folders = ['private', 'public'];

  const routesPath = resolve(__dirname, '..', '..', 'src', 'main', 'routes');

  const routes = [];

  const promises = folders.map(async (folder) => {
    try {
      const targetFolder = resolve(routesPath, folder);
      const files = await readdir(targetFolder);

      const targetFiles = files.filter(
        (file) => file.includes('.ts') || file.includes('.js')
      );

      const internPromises = targetFiles.map(async (targetFile) => {
        const filePath = resolve(targetFolder, targetFile);
        const content = await readFile(filePath, 'utf8');
        const uriPattern = /(['|"|`]\/.*['\\"|`])/gm;
        const matches = content.match(uriPattern);
        const filteredMatches = [...new Set(matches)];

        for (const match of filteredMatches) {
          const routeWithoutQuotes = match.replace(/[',",`]/g, '');
          if (
            routeWithoutQuotes.includes('/internal/') ||
            PATHS_TO_IGNORE.includes(routeWithoutQuotes)
          )
            continue;
          routes.push(routeWithoutQuotes);
        }
      });

      return Promise.all(internPromises);
    } catch (error) {
      return null;
    }
  });

  await Promise.all(promises);

  return routes;
};

export const makeIngressHosts = (routes, environment, baseUrl) => {
  if (routes.length === 0) return [];

  const paths = routes.map((path) => ({
    path: baseUrl + path,
    pathType: 'Exact',
  }));

  const hosts =
    ENVIRONMENT_VALUES?.[environment.toUpperCase()]?.INGRESS_HOSTS ?? [];

  return hosts.map((host) => ({ host, paths }));
};
