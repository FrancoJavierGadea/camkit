/**
 * @typedef {Object} LoaderConfig
 * @property {'top'|'bottom'} [position]
 * @property {number} [offset]
 * @property {number} [gap]
 * @property {string[][]} [keyframes]
 * @property {string[]} [styles]
 * @property {LoaderMessage} [message]
 * @property {(text:string, ...styles:string[]) => string} [format]
 */

import TextUtils from "#bin/utils/text/TextUtils.js";


const LOADERS = {
    DEFAULT: {
        frames: {
            loading:  [
                ['⠋'],
                ['⠙'],
                ['⠹'],
                ['⠸'],
                ['⠼'],
                ['⠴'],
                ['⠦'],
                ['⠧'],
                ['⠇'],
                ['⠏']
            ],
            complete: ['✔'],
            error: ['✖'],
        }
    }
}

export class Loader {

    static defaults = {
        
        frames: LOADERS.DEFAULT.frames,
        offset: 2,
        gap: 1,
        styles: ['white', 'bold'],
        messages: {
            loading: {
                text: ['Loading...'],
                styles: ['dim']
            },
            complete: {
                text: ['Done!'],
                styles: ['green']
            },
            error: {
                text: ['Error!'],
                styles: ['red']
            }
        },
        format: (text) => text
    };

    #iterator = null;

    constructor(params = {}){

        /** @type {LoaderConfig} */
        const config = Object.assign({}, Loader.defaults, params);
        config.messages = {
            loading: Object.assign({}, Loader.defaults.messages.loading, params.messages?.loading),
            complete: Object.assign({}, Loader.defaults.messages.complete, params.messages?.complete),
            error: Object.assign({}, Loader.defaults.messages.error, params.messages?.error),
        }

        this.position = config.position;
        this.offset = config.offset;
        this.gap = config.gap;
        this.styles = Array.isArray(config.styles) ? config.styles : [config.styles];

        this.frames = {
            loading: config.frames.loading,
            complete: config.frames.complete,
            error: config.frames.error,
        
            values: () => config.frames.loading[Symbol.iterator](),

            width: TextUtils.measureLines(...config.frames.loading),
            height: config.frames.loading[0].length,
        };

        this.messages = {
            loading: this._normalizeMessage(config.messages.loading),
            complete: this._normalizeMessage(config.messages.complete),
            error: this._normalizeMessage(config.messages.error),
        };
        
        
        // --- Formatter ---
        this.format = (text, styles = []) => {
            return config.format(text, ...(Array.isArray(styles) ? styles : [styles]));
        };
    }

    _normalizeMessage({text, styles} = {}){

        const message = {
            text: [],
            styles: []
        };

        // text → array
        if (typeof text === 'string') {
            message.text = text.split('\n');
        } 
        else if (Array.isArray(text)) {
            message.text = text.filter(Boolean).map(String);
        }

        // styles → array
        if (typeof styles === 'string') {
            message.styles = [styles];
        } 
        else if (Array.isArray(styles)) {
            message.styles = styles.filter(Boolean).map(String);
        }

        message.width = TextUtils.measureLines(...message.text);
        message.height = message.text.length;

        return message;
    }

    /**
     * Returns next frame (raw, unformatted).
     * @returns {string[]}
     */
    frame(){

        this.#iterator ??= this.frames.values();

        let { value } = this.#iterator.next();

        if(!value){
            this.#iterator = this.frames.values();
            
            value = this.#iterator.next().value;
        }

        return value;
    }

    render(opt = {}) {

        const {complete, error} = opt;

        const rawFrame = complete ? this.frames.complete : 
            error ? this.frames.error : 
            this.frame();

        const message = complete ? this.messages.complete : 
            error ? this.messages.error : 
            this.messages.loading;

        // 2. Formatear mensaje
        const loaderLines = rawFrame.map(part => this.format(part, this.styles));

        // --- Message lines ---
        const messageLines = message.text.map(line => this.format(line, message.styles));

        // 3. Merge horizontal
        const merged = TextUtils.mergeLines(
            { 
                lines: loaderLines, 
                width: this.frames.width, 
                height: this.frames.height 
            },
            { 
                lines: messageLines, 
                width: message.width, 
                height: message.height 
            },
            { gap: this.gap, offset: this.offset }
        );

        return merged;
    }

    reset(){
        this.#iterator = null;
    }
}

export default Loader;



// const loader = new Loader({});

// setInterval(() => {

//     console.log(loader.render({error: true}));

// }, 200);