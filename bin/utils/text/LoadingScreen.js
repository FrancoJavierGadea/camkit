import Loader from "./Loader.js";

export class LoadingScreen {

    static defaults = {
        interval: 100,
        content: []
    };

    static out = process?.stderr;

    #intervalID = null;
    #previousContentHeight = 0;

    constructor(params = {}) {
        const config = Object.assign({}, LoadingScreen.defaults, params);

        this.interval = config.interval;
        this.setContent(config.content);
    }

    // --- Normalize content ---
    setContent(content = []) {

        if(typeof content === 'string') {
            this.content = [content];
            return;
        }

        if(Array.isArray(content)) {
            this.content = content;
            return;
        }

        this.content = [];
    }

    start(content = []) {

        if(content.length) this.setContent(content);

        //ocultar cursor
        LoadingScreen.out.write('\x1B[?25l');

        this.render();
        this.#intervalID = setInterval(() => this.render(), this.interval);
    }

    render() {

        const lines = [];

        // limpiar render anterior
        this.clearScreen();

        for(const item of this.content) {

            // --- Loader ---
            if(item instanceof Loader) {
                const { lines: loaderLines } = item.render();
                lines.push(...loaderLines);
                continue;
            }

            // --- Function (lazy render) ---
            if(typeof item === 'function') {

                const result = item();

                if(result?.lines) {
                    lines.push(...result.lines);
                } 
                else if (Array.isArray(result)) {
                    lines.push(...result.map(String));
                } 
                else {
                    lines.push(String(result));
                }

                continue;
            }

            // --- Array (multiline block) ---
            if(Array.isArray(item)) {
                lines.push(...item.map(String));
                continue;
            }

            // --- String / fallback ---
            lines.push(String(item));
        }

        this.#previousContentHeight = lines.length;

        LoadingScreen.out.write(lines.join('\n') + '\n');
    }

    stop() {

        if(this.#intervalID) {
            clearInterval(this.#intervalID);
            this.#intervalID = null;
        }

        // limpiar última render
        this.clearScreen();

        // mostrar cursor
        LoadingScreen.out.write('\x1B[?25h');

        this.content = [];
    }

    clearScreen(){
        if(this.#previousContentHeight > 0){
            LoadingScreen.out.cursorTo(0);
            LoadingScreen.out.moveCursor(0, -this.#previousContentHeight);
            LoadingScreen.out.clearScreenDown();
            this.#previousContentHeight = 0;
        }
    }
}

export default LoadingScreen;



// const loader = new Loader();
// const numbers = [];

// const loading = new LoadingScreen();

// loading.start([
//     "Contador:",
//     loader,
//     () => numbers.map(n => `- ${n}`)
// ]);

// const id = setInterval(() => {
//     numbers.push((numbers.at(-1) ?? 0) + 1);
// }, 1000);

// setTimeout(() => {
//     loading.stop();
//     clearInterval(id);
// }, 5000);