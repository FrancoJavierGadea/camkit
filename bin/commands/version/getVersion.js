import fs from 'node:fs/promises';
import path from 'node:path';


export async function getVersion() {
    
    const pathToJson = path.join(process.cwd(), 'package.json');

    const rawJson = await fs.readFile(pathToJson, 'utf-8');

    const packageJson = JSON.parse(rawJson);

    const {version, name} = packageJson;

    console.log(`${name}: ${version}`);
}