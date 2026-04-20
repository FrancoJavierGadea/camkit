import XMLParser from "../utils/xml/XMLParser.js";
import { Tag } from "../utils/xml/nodesUtils.js";
import { Cast } from "../utils/xml/ObjectUtils.js";

export async function getSnapshotUri(onvifDevice, profileToken, params = {}){

    const xml = await onvifDevice.getSnapshotUri(profileToken, params);

    const tree = XMLParser.parse(xml);
    
    const results = Cast.unescapeXML({
        uri: XMLParser.getText(tree, Tag.endsWith('MediaUri'), Tag.endsWith('Uri'))
    });

    return results;
}