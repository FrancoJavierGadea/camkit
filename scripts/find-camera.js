#!/usr/bin/env node

import { parseArgs } from "../scripts/parse-args.js";
import { findCamerasByBroadcast } from "../src/utils/camera/index.js";

const CONFIG = {
    HOST_IP: {
        defaultValue: null,
        alias: ['-ip', '--host-ip', '--my-ip']
    },
    METHOD: {
        defaultValue: 'brodcast',
        alias: ['-m', '--method']
    },
    TIMEOUT: {
        defaultValue: 3000,
        alias: ['-t', '--timeout']
    },
    LOGS: {
        defaultValue: false,
        alias: ['-l', '--logs']
    }
};

const METHODS = {
    BRODCAST: 'brodcast',
    IP: 'ip'
};

const PARAMS = parseArgs(CONFIG, process.argv);



if(PARAMS.METHOD?.toLowerCase() === METHODS.BRODCAST){

    const results = await findCamerasByBroadcast({
        localAddress: PARAMS.HOST_IP,
        timeout: PARAMS.TIMEOUT,
        logs: PARAMS.LOGS
    });

    for (const [ip, address] of results) {
        
        console.log(`\n> Camera found at IP: ${ip}`);
        console.log(`Address: ${address}\n`);
    }
}