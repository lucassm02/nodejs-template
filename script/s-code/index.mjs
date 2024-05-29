/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

async function createFilesFromSCodeFile(sCodeContent) {
  const files = sCodeContent.split('--- File Path:').slice(1);

  if (files.length === 0) {
    console.error('Não foi encontrado nenhum arquivo para extração');
    return;
  }

  for (let i = 0; i < files.length; i++) {
    const filePathFromString = files[i].split('\n')[0].trim();
    const filePath = path.join(process.cwd(), filePathFromString);
    const rawContent = files[i].trim();
    const startOfContent = rawContent.indexOf('\n') + 1;
    const content = rawContent.substring(startOfContent);
    const dir = path.dirname(filePath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content);

    console.warn(`Arquivo criado: ${filePath}`);
  }
}

async function main() {
  const input = process.argv[2];

  if (!input) {
    console.error('Uso: yarn s-code <file-path-or-url>');
    process.exit(1);
  }

  try {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const response = await axios.get(input);
      const content = response.data;
      await createFilesFromSCodeFile(content);

      return;
    }

    const content = await fs.readFile(input, 'utf-8');
    await createFilesFromSCodeFile(content);
  } catch (error) {
    console.error(
      `Não foi possível carregar o conteúdo ${input}: ${error.message}`
    );

    process.exit(1);
  }

  console.log('Conteúdo carregado!');
  console.log('iniciando processamento...');
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
