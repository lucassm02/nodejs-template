/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

async function createFilesFromSCodeFile(sCodeContent) {
  const files = sCodeContent.split(/---\s*path:\s*/i).slice(1);

  if (files.length === 0) {
    console.error('Não foi encontrado nenhum arquivo para extração');
    process.exit(0);
  }

  for (const file of files) {
    const [filePathFromString, ...contentLines] = file.trim().split('\n');
    const filePath = path.join(process.cwd(), filePathFromString.trim());
    const content = contentLines.join('\n').trim();
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
    const content =
      input.startsWith('http://') || input.startsWith('https://')
        ? (await axios.get(input)).data
        : await fs.readFile(input, 'utf-8');

    await createFilesFromSCodeFile(content);
  } catch (error) {
    console.error(
      `Não foi possível carregar o conteúdo ${input}: ${error.message}`
    );
    process.exit(1);
  }

  console.log('Conteúdo carregado e processamento iniciado!');
  process.exit(0);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
