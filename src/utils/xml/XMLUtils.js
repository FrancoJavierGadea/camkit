

export const XMLUtils = {
    
    XML_ENTITIES: {
        AMP: { char: '&', escaped: '&amp;' },
        LT: { char: '<', escaped: '&lt;' },
        GT: { char: '>', escaped: '&gt;' },
        QUOT: { char: '"', escaped: '&quot;' },
        APOS: { char: "'", escaped: '&apos;' },
        NBSP: { char: ' ', escaped: '&nbsp;' }
    },

    unescapeXML(xml) {

        let result = xml;
        
        for(const { escaped, char } of Object.values(this.XML_ENTITIES)) {

            result = result.replaceAll(escaped, char);
        }

        return result;
    }
}