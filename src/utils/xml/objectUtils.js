import { XMLUtils } from "./XMLUtils.js";

export const Cast = {

    unescapeXML(attrs, ...keys) {

        let k = Array.isArray(keys[0]) ? keys[0] : keys;

        if(k.length === 0) k = Object.keys(attrs);

        const cloned = {...attrs};

        for(const key of k){

            if(Object.hasOwn(attrs, key)) {

                console.log(attrs[key]);

                //unescape
                cloned[key] = XMLUtils.unescapeXML(attrs[key]);
            }
        }

        return cloned;
    },

    toNumber(attrs, ...keys){

        let k = Array.isArray(keys[0]) ? keys[0] : keys;

        if(k.length === 0) k = Object.keys(attrs);

        const cloned = {...attrs};

        for(const key of k){

            if(Object.hasOwn(attrs, key)) {
                cloned[key] = Number(attrs[key]);
            }
        }

        return cloned;
    },

    toBoolean(attrs, ...keys){

        let k = Array.isArray(keys[0]) ? keys[0] : keys;

        if(k.length === 0) k = Object.keys(attrs);

        const cloned = {...attrs};

        for(const key of k){
            
            if(Object.hasOwn(attrs, key)){

                if(typeof attrs[key] === 'string'){
                    cloned[key] = attrs[key].toLowerCase() === 'true';
                }
                else {
                    cloned[key] = Boolean(attrs[key]);
                }
            }
        }

        return cloned;
    }
}