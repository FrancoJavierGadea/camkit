
import TextUtils from "../utils/text/TextUtils.js";

export class Header {

    static defaults = {
        offset: 0,
        gap: 2,
        table: null,
        logo: null,
        format: (text) => text,

        title: {
            show: true,
            text: 'ONVIF camera toolkit for Node.js for manage your cameras with console command and API',
            styles: ['dim', 'white'],
            offset: 5
        }
    }

    constructor(params = {}){

        const config = Object.assign({}, Header.defaults, params);
        config.title = Object.assign({}, Header.defaults.title, config.title);

        this.gap = config.gap;
        this.table = config.table;
        this.logo = config.logo;
        this.title = config.title;

        this.format = (text, styles) => {
            return config.format(text, ...(Array.isArray(styles) ? styles : [styles]));
        }
    }

    render(){
        const lines = [];

        //Logo
        const Logo = this.logo.render(this.format);
        lines.push(...Logo.lines);

        //Title (Not affect size)
        if(this.title.show){

            const {text, styles, offset} = this.title;

            const titleLines = TextUtils.wrapText(text, Logo.width - offset * 2);

            for(const line of titleLines) {

                const text =  TextUtils.centerText(line, Logo.width);

                lines.push( this.format(text , styles) );
            }
        }

        //Table
        if(this.table){

            return TextUtils.mergeLines(
                { lines: lines, width: Logo.size, height: lines.length },
                this.table.render(), 
                { gap: this.gap, offset: this.offset }
            );
        }
           
        return { lines, width: Logo.width, height: lines.length }
    }
}


export default Header;