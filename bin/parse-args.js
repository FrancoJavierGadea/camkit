

export function parseArgs(config, argv){

    const result = {};

    // valores por defecto
    for(const key in config) {
        result[key] = config[key].defaultValue;
    }

    for (let i = 2; i < argv.length; i++) {

        const arg = argv[i];

        for(const key in config) {
            const aliases = config[key].alias;

            // --param=value
            const matchedAlias = aliases.find(alias => arg === alias || arg.startsWith(alias + '='));

            if(matchedAlias){
                if(arg.includes('=')) {

                    result[key] = arg.split('=')[1];
                } 
                else {
                    const next = argv[i + 1];

                    if(next && !next.startsWith('-')){
                        result[key] = next;
                        i++;
                    } 
                    else {
                        result[key] = true;
                    }
                }
            }
        }
    }

    return result;
}