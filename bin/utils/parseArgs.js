

export function parseArgs(options, args){

    if(!options || !args || !args.length === 0) return null;

    const result = {};

    // valores por defecto
    for(const key in options) {
        result[key] = options[key].defaultValue;
    }

    for(let i = 0; i < args.length; i++) {

        const arg = args[i];

        for(const key in options) {
            const aliases = options[key].alias;

            // --param=value
            const matchedAlias = aliases.find(alias => arg === alias || arg.startsWith(alias + '='));

            if(matchedAlias){
                if(arg.includes('=')) {

                    result[key] = arg.split('=')[1];
                } 
                else {
                    const next = args[i + 1];

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

    for(const key in options) {
        if(options[key].required && result[key] == null){
            throw new Error(`Missing required parameter: ${key} (${options[key].alias.join(', ')})`);
        }
    }

    return result;
}