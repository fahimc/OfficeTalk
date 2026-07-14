import { readdir, readFile, writeFile } from 'node:fs/promises';

const sourceDir = new URL('./source/', import.meta.url);
const outputFile = new URL('./rigged_office_character_demo.html', import.meta.url);

const parts = (await readdir(sourceDir))
  .filter((name) => /^part-\d+\.htmlpart$/.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (parts.length === 0) {
  throw new Error('No source parts were found in ./source/.');
}

const chunks = await Promise.all(
  parts.map((name) => readFile(new URL(name, sourceDir), 'utf8')),
);

await writeFile(outputFile, chunks.join(''), 'utf8');
console.log(`Built ${outputFile.pathname} from ${parts.length} source parts.`);
