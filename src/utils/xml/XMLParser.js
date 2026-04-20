


export const XMLParser = {

    async scan(xml, handlers = {}){

        let i = 0;

        const tagStack = [];

        while (i < xml.length) {

            //Detect Open tag 
            if(xml[i] === '<') {

                //Detect Close tag
                if(xml[i + 1] === '/') {
                    const end = xml.indexOf('>', i);
                    const tag = xml.slice(i + 2, end).trim();

                    tagStack.pop();
                    handlers.onClose?.(tag);

                    i = end + 1;
                    continue;
                } 

                const end = xml.indexOf('>', i);
                const rawTag = xml.slice(i + 1, end).trim();

                const spaceIndex = rawTag.indexOf(' ');
                let tag = rawTag;
                let attrs = {};

                if(spaceIndex !== -1) {
                    tag = rawTag.slice(0, spaceIndex);

                    const attrString = rawTag.slice(spaceIndex + 1)

                    attrString.replace(/([^\s=]+)\s*=\s*(['"])(.*?)\2/g, (_, key, quote, value) => {
                        attrs[key] = value;
                    });
                }

                tagStack.push({ tag, attrs, parent: tagStack.at(-1) });
                handlers.onOpen?.(tag, attrs);

                i = end + 1;
            } 
            else {
                // texto
                const next = xml.indexOf('<', i);
                const text = xml.slice(i, next === -1 ? xml.length : next).trim();

                if(text) {
                    handlers.onText?.(text, tagStack.at(-1));
                }

                i = next === -1 ? xml.length : next;
            }
        }
    },

    async getTextValues(xml, tag){

        const result = new Map();

        const addResult = (key, value) => {

            if(result.has(key)){

                result.get(key).push(value)
            }
            else {
                result.set(key, [value]);
            }
        }

        await this.scan(xml, {
            onText: (text, context) => {

                if(typeof tag === 'string'){

                    if(context.tag === tag) addResult(context.tag, text);
                }
                if(tag instanceof RegExp){

                    if(tag.test(context.tag)) addResult(context.tag, text);
                }
                if(Array.isArray(tag)){

                    if(tag.includes(context.tag)) addResult(context.tag, text);
                }
                if(typeof tag === 'function'){
                    
                    if(tag(context.tag)) addResult(context.tag, text);
                }
            },
        });

        return result;
    },


    //MARK: Parse to AST
    parse(xml){

        let i = 0;

        const root = {
            type: 'root',
            tag: null,
            attrs: {},
            children: []
        };

        const tagStack = [root];

        while(i < xml.length) {

            const parent = tagStack.at(-1);

            if(xml[i] === '<') {

                // closing tag
                if (xml[i + 1] === '/') {
                    const end = xml.indexOf('>', i);
                    tagStack.pop();
                    i = end + 1;
                    continue;
                }

                const end = xml.indexOf('>', i);
                const rawTag = xml.slice(i + 1, end).trim();

                if(rawTag.startsWith('?xml')) {
                    i = end + 1;
                    continue;
                }

                const isSelfClosing = rawTag.endsWith('/');

                const spaceIndex = rawTag.indexOf(' ');
                let tag = isSelfClosing ? rawTag.slice(0, spaceIndex !== -1 ? spaceIndex : -1) : rawTag;
                let attrs = {};

                if(spaceIndex !== -1) {
                    tag = rawTag.slice(0, spaceIndex);

                    const attrString = rawTag.slice(spaceIndex + 1);

                    attrString.replace(/([^\s=]+)\s*=\s*(['"])(.*?)\2/g, (_, key, quote, value) => {
                        attrs[key] = value;
                    });
                }

                const node = {
                    type: 'node',
                    tag,
                    attrs,
                    children: [],
                    //parent
                };

                parent.children.push(node);

                if(!isSelfClosing) tagStack.push(node);
                

                i = end + 1;
            }
            else {
                const next = xml.indexOf('<', i);
                const text = xml.slice(i, next === -1 ? xml.length : next).trim();

                if(text) {
                    parent.children.push({
                        type: 'text',
                        value: text
                    });
                }

                i = next === -1 ? xml.length : next;
            }
        }

        return root;
    },

    //MARK: Get
    getNode(tree, predicate = () => true){

        if(tree.type === 'node' && predicate(tree)) return tree;

        if((tree.type === 'node' || tree.type === 'root') && Array.isArray(tree.children)) {

            for(const child of tree.children) {

                const result = this.getNode(child, predicate);

                if(result) return result;
            }
        }
          
        return null;
    },

    getNodes(tree, predicate = () => true){

        const results = [];

        const pushNodes = (tree) => {

            if(tree.type === 'node' && predicate(tree)) results.push(tree);

            if((tree.type === 'node' || tree.type === 'root') && Array.isArray(tree.children)) {

                for(const child of tree.children) {

                    pushNodes(child);
                }
            }
        }

        pushNodes(tree);

        return results;
    },

    getNodeAt(tree, ...predicates){

        // accepts both getNodeAt(tree, p1, p2) and getNodeAt(tree, [p1, p2])
        const preds = Array.isArray(predicates[0]) ? predicates[0] : predicates;

        if(preds.length === 0) return tree;

        const [head, ...tail] = preds;

        const node = this.getNode(tree, head);

        if(!node) return null;
        if(tail.length === 0) return node;

        for(const child of node.children){

            const result = this.getNodeAt(child, tail);

            if(result) return result;
        }

        return null;
    },

    getText(tree, ...predicates){

        const node = this.getNodeAt(tree, predicates);

        const child = node?.children.at(-1);

        if(child?.type === 'text') return child.value;

        return null;
    },

    getAttrs(tree, ...predicates){

        const node = this.getNodeAt(tree, predicates);

        return node?.attrs ?? null;
    },

    toNumber(attrs, ...keys){

        let k = Array.isArray(keys[0]) ? keys[0] : keys;

        if(k.length === 0) k = Object.keys(attrs);

        const cloned = {...attrs};

        for(const key of k) cloned[key] = Number(attrs[key]);

        return cloned;
    },

    toBoolean(attrs, ...keys){

        let k = Array.isArray(keys[0]) ? keys[0] : keys;

        if(k.length === 0) k = Object.keys(attrs);

        const cloned = {...attrs};

        for(const key of k){
            
            if(typeof attrs[key] === 'string'){
                cloned[key] = attrs[key].toLowerCase() === 'true';
            }
            else {
                cloned[key] = Boolean(attrs[key]);
            }
        }

        return cloned;
    }
}


export default XMLParser;