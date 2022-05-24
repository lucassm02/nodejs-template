import { readdirSync } from 'fs';
import path from 'path';

export const enableRoutes = async (
  type: 'public' | 'private'
): Promise<void> => {
  const routesFolderPath = path.resolve(__dirname, '..', 'routes', type);
  const extensionsToSearch = ['.ts', '.js'];

  const promises = readdirSync(routesFolderPath).map(async (file) => {
    const conditionOne = !file.includes('.spec.') && !file.endsWith('.map');
    const conditionTow = extensionsToSearch.map((ext) => !!file.endsWith(ext));
    if (conditionOne && conditionTow) {
      await import(`${routesFolderPath}/${file}`);
    }
  });

  await Promise.all(promises);
};
