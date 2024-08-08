/* eslint-disable no-case-declarations */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import fs from 'fs';
import path from 'path';
import fsPromises from 'fs/promises';
import axios from 'axios';

const COMPATIBLE_VERSION = '0.1';

function readAndCombineFiles(dir, combinedContent = '', filePaths = []) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      ({ combinedContent, filePaths } = readAndCombineFiles(
        fullPath,
        combinedContent,
        filePaths
      ));
      continue;
    }
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    combinedContent += `--- Path: ${fullPath}\n${fileContent}\n`;
    filePaths.push(fullPath);
  }
  return { combinedContent, filePaths };
}

function convertToSCode(content, outputPath) {
  const sCodeContent = `--- Version: ${COMPATIBLE_VERSION}\n${content}`;
  fs.writeFileSync(outputPath, sCodeContent, 'utf8');
}

async function createFilesFromSCodeFile(sCodeContent) {
  const versionMatch = sCodeContent.match(/---\s*Version:\s*(.*)\n/i);
  if (!versionMatch || versionMatch[1].trim() !== COMPATIBLE_VERSION) {
    console.error(
      `Versão incompatível ou ausente no arquivo sCode. Esperado: ${COMPATIBLE_VERSION}`
    );
    process.exit(1);
  }

  const files = sCodeContent.split(/---\s*Path:\s*/i).slice(1);

  if (files.length === 0) {
    console.error('Não foi encontrado nenhum arquivo para extração');
    process.exit(0);
  }

  for (const file of files) {
    const [filePathFromString, ...contentLines] = file.trim().split('\n');
    const filePath = path.join(process.cwd(), filePathFromString.trim());
    const content = contentLines.join('\n').trim();
    const dir = path.dirname(filePath);

    await fsPromises.mkdir(dir, { recursive: true });
    await fsPromises.writeFile(filePath, content);

    console.warn(`Importado: ${filePath}`);
  }
}

function exportFiles(targetDirectory, outputFilePath) {
  const { combinedContent } = readAndCombineFiles(targetDirectory);
  convertToSCode(combinedContent, outputFilePath);
  console.log(`Exportação concluída, arquivo: ${outputFilePath}`);
}

async function importFiles(input) {
  try {
    const content =
      input.startsWith('http://') || input.startsWith('https://')
        ? (await axios.get(input)).data
        : await fsPromises.readFile(input, 'utf-8');

    await createFilesFromSCodeFile(content);
  } catch (error) {
    console.error(
      `Não foi possível carregar o conteúdo ${input}: ${error.message}`
    );
    process.exit(1);
  }

  console.log('Fim da importação');
  process.exit(0);
}

function showHelp() {
  console.log(`
Uso: node script.js <comando> <args>

Comandos:
  export <diretório> [output]    Exporta arquivos do diretório especificado para um arquivo sCode.
  import <file-path-or-url>      Importa arquivos a partir de um arquivo sCode ou URL.

Exemplos:
  node script.js export ./src combined_minified.scode
  node script.js import combined_minified.scode
  node script.js import http://example.com/combined_minified.scode
  `);
}

function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command) {
    showHelp();
    process.exit(1);
  }

  switch (command) {
    case 'export':
      if (args.length < 1) {
        console.error('Por favor, forneça um diretório para exportar');
        process.exit(1);
      }
      const targetDirectory = args[0];
      const outputFilePath = args[1] || 'combined_minified.scode';
      exportFiles(targetDirectory, outputFilePath);
      break;

    case 'import':
      if (args.length < 1) {
        console.error('Por favor, forneça um arquivo ou URL para importar');
        process.exit(1);
      }
      importFiles(args[0]);
      break;

    default:
      showHelp();
      process.exit(1);
  }
}

main();
