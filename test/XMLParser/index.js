import {test} from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import XMLParser from '../../src/utils/xml/XMLParser.js';



const FILES = [
    'profiles.xml'
]


test('test', async (t) => {

    const file = path.join(import.meta.dirname, FILES[0]);

    const xml = await fs.readFile(file, 'utf-8');

    await t.test('parse', async (t) => {
        
        const tree = XMLParser.parse(xml);

        await fs.writeFile(path.join(import.meta.dirname, 'tree.json'), JSON.stringify(tree, null, 2), 'utf-8');
    });


});
