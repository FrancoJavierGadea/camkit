import fs from 'node:fs/promises';
import path from 'node:path';

export async function getPackageJson() {

    const pathToJson = path.join(process.cwd(), 'package.json');
    
    const rawJson = await fs.readFile(pathToJson, 'utf-8');

    const packageJson = JSON.parse(rawJson);

    return packageJson;
}