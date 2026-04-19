import { PTZControl } from "../onvif/PTZControl.js";



export class ConsoleControls {

    static DEFAULT_KEYS = {
        UP: {name: 'UP', code: 'ArrowUp', ansi: '\u001b[A'},
        DOWN: {name: 'DOWN', code: 'ArrowDown', ansi: '\u001b[B'},
        LEFT: {name: 'LEFT', code: 'ArrowLeft', ansi: '\u001b[D'},
        RIGHT: {name: 'RIGHT', code: 'ArrowRight', ansi: '\u001b[C'},
        ZOOM_IN: {name: 'ZOOM_IN', code: 'NumpadAdd', ansi: '+'},
        ZOOM_OUT: {name: 'ZOOM_OUT', code: 'NumpadSubtract', ansi: '-'},   
    }

    constructor(params = {}) {

        if(!process?.versions?.node) throw new Error('Incompatible environment: try to run it on Node.js');

        const {
            keys,
            ip,
            port = 8899,
            path = '/onvif/ptz_service',
            profileToken = '000',
            timeout = 3000,
            username,
            password,
            logs = false
        } = params;

        this.controls = new PTZControl({
            ip,
            port,
            path,
            timeout,
            username,
            password,
            profileToken,
            logs
        });

        this.keys = keys ?? ConsoleControls.DEFAULT_KEYS;
    }

    async start(params = {}){

        const {
            OUT_CONTROL = '\u0003'//Ctrl + C
        } = params;

        function debounce(params = {}) {
        
            const {
                inmediate,
                later,
                wait = 200
            } = params;

            let timeout = null;

            return function() {

                const context = this, args = arguments;

                if(timeout){
                    clearTimeout(timeout);
                }
                else {
                    
                    if(typeof inmediate === 'function') inmediate.apply(context, args);
                }

                timeout = setTimeout(() => {

                    if(typeof later === 'function') later.apply(context, args);
                    timeout = null;

                }, timeout ? wait : wait + 700);// The first key repeat from the OS has ~500ms delay
            };
        }

        const move = debounce({
            inmediate: async (key) => {

                switch(key) {

                    case this.keys.UP.ansi:
                        console.log(this.keys.UP.name);
                        await this.controls.moveY(-1);
                        break;

                    case this.keys.DOWN.ansi:
                        console.log(this.keys.DOWN.name);
                        await this.controls.moveY(1);
                        break;

                    case this.keys.LEFT.ansi:
                        console.log(this.keys.LEFT.name);
                        await this.controls.moveX(-1);
                        break;

                    case this.keys.RIGHT.ansi:
                        console.log(this.keys.RIGHT.name);
                        await this.controls.moveX(1);
                        break;

                    case this.keys.ZOOM_IN.ansi:
                        console.log(this.keys.ZOOM_IN.name);
                        break;

                    case this.keys.ZOOM_OUT.ansi:
                        console.log(this.keys.ZOOM_OUT.name);
                        break;

                    default:
                }
            },
            later: async (key) => {
                
                console.log('STOP');
                await this.controls.stop();
            },
            wait: 200
        });


        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        //MARK: Events
        process.stdin.on('data', (key) => {

            if(key === OUT_CONTROL){
                process.exit();
                return;
            }
            
            move(key);
        });
    }
}


new ConsoleControls({
    ip: '192.168.100.231',
    port: 8899,
    path: '/onvif/ptz_service',
    username: 'admin',
    password: 'admin',
    logs: true
})
.start();