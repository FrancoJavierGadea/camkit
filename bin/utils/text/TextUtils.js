

const TextUtils = {

    /**
     * Returns visible width of a string.
     * Default: raw length (override for ANSI-safe).
     */
    measure(text) {
        return text?.length ?? 0;
    },

    /**
     * Returns max width from multiple lines.
     */
    measureLines(...lines) {

        return Math.max(0, ...lines.map(l => TextUtils.measure(l ?? '')));
    },


    //MARK: wrapText
    /**
     * Splits text into lines respecting max width.
     * Basic word-wrap (no hyphenation).
     */
    wrapText(text, width, opt = {}) {

        const { offset = 0 } = opt;

        const maxWidth = Math.max(0, width - offset);

        if(maxWidth <= 0 || TextUtils.measure(text) <= maxWidth) return [text];

        const words = text.split(' ');
        const lines = [];

        let currentLine = '';
        let currentSize = 0;

        for(const word of words) {

            const wordSize = TextUtils.measure(word);
            const space = currentSize > 0 ? 1 : 0;

            if(currentSize + space + wordSize > maxWidth) {

                if (currentLine) lines.push(currentLine);

                currentLine = word;
                currentSize = wordSize;

            } else {

                currentLine += (space ? ' ' : '') + word;
                currentSize += space + wordSize;
            }
        }

        if(currentLine) lines.push(currentLine);

        return lines;
    },

    // MARK: applyOffset
    /**
     * Adds horizontal padding (offset) to a string.
     *
     * @param {string} text - Input text
     * @param {number} [offset=0] - Number of characters to pad
     * @param {Object} [opt]
     * @param {boolean} [opt.start=true] - Apply padding at the start (left)
     * @param {boolean} [opt.end=true] - Apply padding at the end (right)
     * @param {string} [opt.char=' '] - Padding character (only first char is used)
     *
     * @returns {string}
     */
    applyOffset(text, offset = 0, opt = {}) {

        if(!text || offset <= 0) return text ?? '';

        let {
            start = true,
            end = true,
            char = ' '
        } = opt;

        if(!start && !end) return text;

        // Use only first character to avoid unexpected width issues
        char = String(char)[0] ?? ' ';

        const pad = char.repeat(offset);

        return (start ? pad : '') + text + (end ? pad : '');
    },

    // MARK: applyPadding
    /**
     * Applies horizontal padding based on visible width.
     *
     * @param {string} text
     * @param {number} width
     * @param {Object} [opt]
     * @param {boolean} [opt.start=false] - Pad at start (left)
     * @param {boolean} [opt.end=true] - Pad at end (right)
     * @param {string} [opt.char=' ']
     * @returns {string}
     */
    applyPadding(text, width, opt = {}) {

        let {
            start = false,
            end = true,
            char = ' ',
        } = opt;

        if(!start && !end) return text;

        // Use only first character to avoid unexpected width issues
        char = String(char)[0] ?? ' ';

        const size = TextUtils.measure(text);

        if (width <= size) return text;

        const totalPad = width - size;

        let left = 0;
        let right = 0;

        if(start && end) {
            // repartir padding (centrado)
            left = Math.floor(totalPad / 2);
            right = totalPad - left;
        } 
        else if (start) {
            left = totalPad;
        } 
        else {
            right = totalPad;
        }

        return char.repeat(left) + text + char.repeat(right);
    },

    // MARK: centerText
    /**
     * Centers text within a given width.
     *
     * @param {string} text - Input text
     * @param {number} width - Total target width
     * @param {Object} [opt]
     * @param {boolean} [opt.fill=false] - Fill remaining space on the right
     * @param {string} [opt.char=' '] - Padding character
     * @param {(str:string)=>number} [opt.measure] - Custom width function (ANSI-safe)
     *
     * @returns {string}
     */
    centerText(text, width, opt = {}) {

        return TextUtils.applyPadding(text, width, {
            start: true,
            end: true,
            ...opt
        });
    },


    // MARK: mergeLines
    /**
     * Horizontally merges two blocks of text line-by-line.
     *
     * Accepts either:
     *  - string[] (treated as { lines })
     *  - { lines: string[], width?: number, height?: number }
     *
     * @param {string[]|Object} A - Left block
     * @param {string[]|Object} B - Right block
     * @param {Object} [opt]
     * @param {number} [opt.gap=1] - Spaces between blocks
     * @param {number} [opt.offset=0] - Left/right padding applied to final lines
     *
     * @returns {{
     *   lines: string[],
     *   width: number,
     *   height: number
     * }}
     */
    mergeLines(A, B, opt = {}) {

        const { gap = 1, offset = 0 } = opt;

        const normalize = (input) => {

            if(Array.isArray(input)) {
                input = { lines: input };
            }

            const lines = input.lines ?? [];

            const width = input.width ?? (lines.length > 0 ? Math.max(...lines.map(TextUtils.measure)) : 0);

            const height = input.height ?? lines.length;

            return { lines, width, height };
        };

        const left = normalize(A);
        const right = normalize(B);

        const height = Math.max(left.height, right.height);
        const space = ' '.repeat(gap);

        const lines = Array.from({ length: height }, (_, i) => {

            const lineA = left.lines[i] ?? '';
            const lineB = right.lines[i] ?? '';

            const merged =
                TextUtils.applyPadding(lineA, left.width) +
                space +
                TextUtils.applyPadding(lineB, right.width);

            return TextUtils.applyOffset(merged, offset);
        });

        return {
            lines,
            width: left.width + gap + right.width + offset * 2,
            height
        };
    }
};

export default TextUtils;