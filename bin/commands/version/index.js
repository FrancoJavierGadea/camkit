import { getVersion } from "./getVersion.js";


export default {
    command: 'version',
    alias: ['--version', '-v'],
    exec: getVersion,
}