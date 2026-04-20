import XMLParser from "../utils/xml/XMLParser.js";
import { Tag } from "../utils/xml/nodesUtils.js";



export async function getDiviceInfo(onvifDevice, params = {}){

    const xml = await onvifDevice.getDiviceInfo();

    const tree = XMLParser.parse(xml);
    
    //Extract data from xml
    const results = {
        manufacturer: XMLParser.getText(tree, Tag.endsWith('Manufacturer')),
        model: XMLParser.getText(tree, Tag.endsWith('Model')),
        firmwareVersion: XMLParser.getText(tree, Tag.endsWith('FirmwareVersion')),
        serialNumber: XMLParser.getText(tree, Tag.endsWith('SerialNumber')),
    };

    return results;
    
}