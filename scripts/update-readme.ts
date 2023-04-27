import { promises as fs } from 'fs';
import pkg from '../package.json';

async function run() {
  let readme = await fs.readFile('README.md', 'utf-8');
  const properties = pkg.contributes.configuration.properties as Record<string, any>;

  const content = Object.keys(properties).map((key) => {
    let title = key.split('.')[1];
    title = title.replace(/([A-Z])/g, ' $1');
    title = title.charAt(0).toUpperCase() + title.slice(1);

    const desc = properties[key].description;
    const type = properties[key].type;
    const defaultValue = properties[key].default;

    let enumValues = [] as string[];
    if (properties[key].enum)
      enumValues = properties[key].enum;

    const entryContent: string[] = [];
    entryContent.push(`### ${title}`);
    entryContent.push('');
    entryContent.push(`${desc}`);
    entryContent.push('');
    if (enumValues.length > 0) {
      entryContent.push(` **Possible Values:** ${enumValues.map(i => `\`${i}\``).join(', ')}`);
      entryContent.push('');
    }
    entryContent.push('```jsonc');
    entryContent.push('{');
    entryContent.push('   // ... other settings.json');
    if (type === 'boolean')
      entryContent.push(`   "${key}" : ${defaultValue}`);
    else
      entryContent.push(`   "${key}" : "${defaultValue}"`);
    entryContent.push('}');
    entryContent.push('```');

    return entryContent.join('\n');
  }).join('\n\n');

  readme = readme.replace(/<!--config-options-->[\s\S]*<!--config-options-->/, `<!--config-options-->\n${content}\n<!--config-options-->`);
  await fs.writeFile('README.md', readme, 'utf-8');
}

run();
