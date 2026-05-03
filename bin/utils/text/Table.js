
import TextUtils from "#bin/utils/text/TextUtils.js";

/**
 * Renders a plain-text table with configurable alignment, spacing and ANSI styles.
 * 
 * Styles and alignment are resolved with this priority: cell > row > table.
 * Missing values at a lower level fall back to the level above.
 * 
 * @example
 * const table = new Table({
 *     data: [
 *         Table.Row(['ID', 'Name', 'Status'], { styles: ['bold'], align: 'center' }),
 *         ['1', 'Camera 1', 'Online'],
 *     ],
 *     format: ANSI.createFormatter({ enabled: true })
 * });
 */
export class Table {

    static ALIGN = {
        LEFT: 'left',
        CENTER: 'center',
        RIGHT: 'right'
    }

    static defaults = {
        gap: 1, // spaces on each side of the separator
        separator: '|',
        offset: 0, // spaces on each side of the full row
        align: Table.ALIGN.LEFT,
        format: (text) => text,
        styles: [],

    }

    //Mark: TableRow
    /**
     * Represents a row in the table.
     * Normalizes each cell to { text, styles, align } on construction.
     */
    static TableRow = class {

        constructor(data = [], params = {}){

            //Normalize table cells data
            this.data = [];

            for(const cell of data) {

                this.data.push(
                    this.normalizeCellValue(cell)
                );
            }

            this.styles = params.styles ?? null;
            this.align = params.align ?? null;
        }

        normalizeCellValue(value){

            const cell = { text: '', styles: null, align: null };

            // null / undefined
            if(value == null) return cell;
            
            // objeto (pero no array)
            if (typeof value === 'object' && !Array.isArray(value)) {

                const {text, styles, align} = value;

                if(text != null) cell.text = String(text);

                if(styles != null) cell.styles = Array.isArray(styles) ? styles : [styles];
                
                if(align != null) cell.align = align;

                return cell;
            }

            // cualquier otro tipo → string
            cell.text = String(value);

            return cell;
        };

        [Symbol.iterator](){
            return this.data[Symbol.iterator]();
        }
        
        get length(){
            return this.data.length;
        }
        
        cell(index){
            return this.data[index];
        }
    }

    /**
     * Convenience factory — equivalent to `new Table.TableRow(data, params)`
     */
    static Row(data = [], params = {}){

        return new Table.TableRow(data, params);
    }

    constructor(params = {}){

        const config = {};
        Object.assign(config, Table.defaults, params);

        this.gap = config.gap;
        this.separator = config.separator;
        this.offset = config.offset;
        this.align = config.align;
        this.format = config.format;
        this.styles = config.styles;

        this.format = (text, styles) => {
            return config.format(text, ...(Array.isArray(styles) ? styles : [styles]));
        }

        this.data = [];
        this.columns = {
            sizes: [],
            count: 0
        };

        this.push(...config.data);
    }

    get size(){
        // Calculate total table width:
        let width = 0;

        // - Sum all column widths
        for(const cs of this.columns.sizes) width += cs;

        // - Add gaps and separators between columns
        width += (this.gap * 2 + this.separator.length) * (this.columns.count - 1);

        // - Add horizontal offset (left + right padding)
        width += this.offset * 2;

        return {
            width,
            height: this.data.length
        };
    }

    //MARK: RenderCell
    /**
     * Renders a single cell: apply alignment (left/right/center) and then styles
     * @param {string} text
     * @param {string} align - Table.ALIGN value
     * @param {string|string[]} styles - passed to the formatter
     * @param {number} size - column width in characters
     * @returns {string}
     */
    renderCell(params = {}){

        const {CENTER, LEFT, RIGHT} = Table.ALIGN;
        const {text, styles, align, width} = params;

        let cellText = align === CENTER ? TextUtils.centerText(text, width) : 
            TextUtils.applyPadding(text, width, {
                start: align === RIGHT,
                end: align === LEFT
            });
            

        return this.format(cellText, styles);
    }

    render(){

        const lines = [];

        const separator = TextUtils.applyOffset(this.separator, this.gap);

        for(const row of this.data) {

            const line = [];

            for(let i = 0; i < row.length; i++) {
                
                const size = this.columns.sizes[i];

                const cell = row.cell(i);

                const text = cell.text;
                const styles = cell.styles ?? row.styles ?? this.styles;
                const align = cell.align ??  row.align ?? this.align;

                const cellText = this.renderCell({text, styles, align, width: size});

                line.push(cellText);
            }

            lines.push( TextUtils.applyOffset(line.join(separator), this.offset) ) ;
        }

        return { ...this.size, lines };
    }

    push(...rows){

        for(const row of rows) {

            // Normalize rows to TableRow
            const Row = row instanceof Table.TableRow ? row : Table.Row(row);

            // Update column count
            this.columns.count = Math.max(this.columns.count, Row.length);

            for(let i = 0; i < Row.length; i++) {
                
                const text = Row.cell(i).text;

                // Determine the width of each column
                // by tracking the longest text seen at each column index
                this.columns.sizes[i] = Math.max(this.columns.sizes[i] ?? 0, text.length);
            }

            this.data.push(Row);
        }
    }

    clear(){
        this.data = [];
        this.columns.sizes = [];
        this.columns.count = 0;
    }
}


export default Table;



// const table = new Table({

//     data: [
//         Table.Row(['ID', 'Name', 'Status'], { styles: ['bold'], align: 'center' }),
//         [
//             {text: '1', align: 'center'}, {text: 'Camera 1'}, {text: 'Online'}
//         ],
//         [
//             {text: '2', align: 'center'}, {text: 'Camera 2'}, {text: 'Offline'}
//         ],
//     ],
//     gap: 1

// })

// table.push(
//     [
//         {text: '3', align: 'center'}, {text: 'Camera 3'}, {text: 'Online'}
//     ],
//     [
//         {text: '4ssdsdsd', align: 'center'}, {text: 'Camerasdsdsdsa 4'}, {text: 'Offlinesdddssd'}
//     ]
// )


// console.log(
//     table.render().lines.join('\n')
// );