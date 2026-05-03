
/**
 * @typedef { 'bold' | 'dim' | 'italic' | 'underline' | 'inverse' } ANSIStyle
 * @typedef { 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' } ANSIColors
 * @typedef { 'bg_black' | 'bg_red' | 'bg_green' | 'bg_yellow' | 'bg_blue' | 'bg_magenta' | 'bg_cyan' | 'bg_white' } ANSIBackgroundColors
 * @typedef { `rgb(${number},${number},${number})` } RGBColor
 * @typedef  {`#${String}` } HEXColor
 * @typedef { `bg_#${String}` | `bg:#${String}` | `bg:rgb(${number},${number},${number})` | `bg_rgb(${number},${number},${number})` } CustomBackgroundColor
 * 
 * @typedef { ANSIStyle | ANSIColors | ANSIBackgroundColors | RGBColor | HEXColor | CustomBackgroundColor } ANSITextStyle;
 */
/**
 * @typedef {object} ANSIFormatterControls
 * @property {boolean}      enabled  - Whether the formatter is active.
 * 
 * @typedef {((text:String, ...styles:(...(ANSITextStyle | ANSITextStyle[])) => string) & ANSIFormatterControls} ANSIFormatter
 */

//MARK: ANSI
export const ANSI = {

    STYLE: {
        BOLD: 'bold',
        DIM: 'dim',
        ITALIC: 'italic',
        UNDERLINE: 'underline',
        INVERSE: 'inverse',
    },
    COLOR: {
        BLACK: 'black',
        RED: 'red',
        GREEN: 'green',
        YELLOW: 'yellow',
        BLUE: 'blue',
        MAGENTA: 'magenta',
        CYAN: 'cyan',
        WHITE: 'white',
    },
    BACKGROUND: {
        BLACK: 'bg_black',
        RED: 'bg_red',
        GREEN: 'bg_green',
        YELLOW: 'bg_yellow',
        BLUE: 'bg_blue',
        MAGENTA: 'bg_magenta',
        CYAN: 'bg_cyan',
        WHITE: 'bg_white',
    },


    codes: {
        styles: {
            bold: 1,
            dim: 2,
            italic: 3,
            underline: 4,
            inverse: 7
        },
        foreground: {
            black: 30,
            red: 31,
            green: 32,
            yellow: 33,
            blue: 34,
            magenta: 35,
            cyan: 36,
            white: 37
        },
        background: {
            black: 40,
            red: 41,
            green: 42,
            yellow: 43,
            blue: 44,
            magenta: 45,
            cyan: 46,
            white: 47
        }
    },


    //MARK: apply
    /** Applies ANSI styles and colors to a text string.
     *
     * Supports:
     * - text styles: `'bold'`, `'underline'`, etc.
     * - ANSI colors: `'red'`, `'blue'`
     * - ANSI background colors: `'bg_red'`, `'bg_blue'`
     * - RGB/HEX colors: `'#ff0000'`, `'rgb(255,0,0)'`
     * - RGB/HEX backgrounds: `'bg:#ff0000'`, `'bg:rgb(255,0,0)'`
     *
     * Styles can be passed as individual arguments or as an array.
     *
     * @param {string} text - Text to format.
     * @param {...(ANSITextStyle | ANSITextStyle[])} styles - One or more ANSI styles/colors.
     * @returns {string} Styled ANSI string.
     *
     * @example
     * ANSI.apply('Hello', 'bold', 'red');
     * ANSI.apply('Hello', ['bold', 'bg:#ff0000']);
     * ANSI.apply('Hello', ANSI.COLOR.RED, ANSI.STYLE.BOLD);
     */
    apply(text, ...styles){

        if(!styles || styles.length === 0) return text;
        if(process.stdout.isTTY === false) return text;

        const Styles = new Set(Array.isArray(styles[0]) ? styles[0] : styles);

        const codes = [];
        const customColors = [];

        for(const styleName of Styles) {

            if(typeof styleName !== 'string') continue;

            //Styles
            if(styleName in this.codes.styles) {
                codes.push(this.codes.styles[styleName]);
            }
            
            //Color
            const isBackground = styleName.startsWith('bg_') || styleName.startsWith('bg:');
            const color = (isBackground ? styleName.slice(3) : styleName).trim();

            const colorCode = this.codes[isBackground ? 'background' : 'foreground'][color];

            if(colorCode){
                codes.push(colorCode);
            }
            else {
                const rgb = getRGBValues(color);

                if(rgb) {
                    const {r, g, b, values} = rgb;
                    customColors.push(`${isBackground ? 48 : 38};2;${values.join(';')}`);
                }
            }
        }

        const ANSIStyle = [...codes.toSorted((a, b) => a - b), ...customColors].join(';');

        return ANSIStyle.length === 0 ? text : `\x1b[${ANSIStyle}m${text}\x1b[0m`;
    },
    

    //MARK: log
    /**
     * Prints styled text to the console.
     *
     * Supports the same styles as {@link ANSI.apply}.
     *
     * @param {string} text - Text to print.
     * @param {...(ANSITextStyle | ANSITextStyle[])} styles - One or more ANSI styles/colors.
     * @returns {void}
     * 
     * @example
     * ANSI.log('Success', 'bold', 'green');
     * ANSI.log('Warning', ['bold', 'bg:#ffaa00']);
     * ANSI.log('Error', ANSI.COLOR.RED, ANSI.STYLE.BOLD);
     */
    log(text, ...styles){

        return console.log(this.apply(text, ...styles));
    },


    //MARK: createFormatter
    /**
     * Creates a callable formatter bound to {@link ANSI.apply}.
     * 
     * Accepts the same arguments as `apply`. When disabled, returns text as-is.
     *
     * @param {object}  [opt={}]              - Options.
     * @param {boolean} [opt.enabled=true]    - Initial enabled state.
     * @returns {ANSIFormatter}
     *
     * @example
     * const fmt = ANSI.createFormatter({ enabled: false });
     * fmt('Hello', 'bold');          // → 'Hello'
     * fmt.enabled = true;
     * fmt('Hello', 'bold', 'red');   // → styled string
     */
    createFormatter(opt = {}){

        const {enabled = true} = opt;

        const self = this;

        const formatter = function(text, ...styles){

            if(!formatter.enabled) return text;

            return self.apply(text, ...styles);
        };

        formatter.enabled = enabled;

        return formatter;
    }
};


//MARK: getRGBValues
function getRGBValues(color = '') {

    color = color.trim().toLowerCase();

    //Hexadecimal
    if(color.startsWith('#')){

        const hex = color.slice(1);

        if( (hex.length !== 3 && hex.length !== 6 && hex.length !== 8) || !/^[0-9a-fA-F]+$/.test(hex) ){
            console.warn('Invalid rgb color');
            return null;
        };

        const values = (hex.length === 3 ? [
            hex[0] + hex[0],
            hex[1] + hex[1],
            hex[2] + hex[2]
        ] : [
            hex.slice(0, 2),
            hex.slice(2, 4),
            hex.slice(4, 6)
        ]).map(v => parseInt(v, 16));

        return {
            r: values[0],
            g: values[1],
            b: values[2],
            values
        };
    }

    //RGB
    if(color.startsWith('rgb')){

        const values = color.slice(color.indexOf('(') + 1, color.indexOf(')'))
            .split(',').map(v => Number(v.trim()));

        if(values.length !== 3 || values.some(v => Number.isNaN(v) || v < 0 || v > 255)) {
            console.warn('Invalid rgb color');
            return null;
        }

        return {
            r: values[0],
            g: values[1],
            b: values[2],
            values
        };
    }
}

export default ANSI;