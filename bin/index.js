#!/usr/bin/env node

import { parseArgs } from "./utils/parseArgs.js";
import COMMANDS from "./commands/index.js";

const [node, file, command, ...args] = process.argv;

const cmd = COMMANDS.find(command);

try {
    
    const options = parseArgs(cmd.options, args);
    
    await cmd.exec(options);

    process.exit(0);
} 
catch(error) {

    console.warn(error.message);
    process.exit(1);
}