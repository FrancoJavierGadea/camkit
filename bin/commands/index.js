
import discovery from "./discovery/index.js";
import version from "./version/index.js";

export default {
    commands: [
        discovery,
        version
    ],
    find(commandText){

        const cmd = this.commands.find(({command, alias}) => command === commandText || alias.includes(commandText));

        return cmd ?? this.defaultCommand;

    }, 
    defaultCommand: version
}