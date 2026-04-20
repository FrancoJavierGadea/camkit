

export const Tag = {

    endsWith(tagName){
        return (node) => node?.tag?.endsWith(tagName);
    }
}