import ANSI from "../utils/text/ANSI.js";

const { RED, YELLOW, GREEN, CYAN, MAGENTA, WHITE } = ANSI.COLOR;
const { DIM, BOLD } = ANSI.STYLE;

const LOGO = {
    letters: [
        [' ██████╗', ' █████╗ ', '███╗   ███╗', '██╗  ██╗', '██╗', '████████╗'],
        ['██╔════╝', '██╔══██╗', '████╗ ████║', '██║ ██╔╝', '██║', '╚══██╔══╝'],
        ['██║     ', '███████║', '██╔████╔██║', '█████╔╝ ', '██║', '   ██║   '],
        ['██║     ', '██╔══██║', '██║╚██╔╝██║', '██╔═██╗ ', '██║', '   ██║   '],
        ['╚██████╗', '██║  ██║', '██║ ╚═╝ ██║', '██║  ██╗', '██║', '   ██║   '],
        [' ╚═════╝', '╚═╝  ╚═╝', '╚═╝     ╚═╝', '╚═╝  ╚═╝', '╚═╝', '   ╚═╝   '],
    ],
    colors: [RED, YELLOW, YELLOW, GREEN, CYAN, MAGENTA],
    style: [BOLD],
    offset: 1,
    gap: 2,

    render(format = (txt) => txt){

        const {gap = 2, colors, style, offset, letters} = this;

        const lines = [];

        const letterCount = letters[0].length;
        const letterSizes = Array.from({ length: letterCount }, () => 0);
        
        for(const parts of letters) {
        
            const aux = [];
    
            for(let i = 0; i < parts.length; i++) {

                const letter = parts[i];
    
                letterSizes[i] = Math.max(letterSizes[i], letter.length);
    
                aux.push( format(letter, colors[i], style) );
            }
    
            const line = ' '.repeat(offset) + aux.join(' '.repeat(gap)) + ' '.repeat(offset);
            lines.push(line);
        }

        let width = 0;
        for(const ls of letterSizes) width += ls;
        width += gap * (letterCount - 1);
        width += offset * 2;
        
        return {
            lines,
            width,
            height: lines.length
        }
    }
};

export default LOGO;
