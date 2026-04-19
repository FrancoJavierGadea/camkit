import XMLParser from "../../xml/XMLParser.js";
import CameraScanner from "./CameraScanner.js";
import OnvifDiscovery from "./OnvifDiscovery.js";


export const CameraFinder = {

    async findByBroadcast(params) {

        const {localAddress, timeout = 5000, logs = false} = params;
        
        const finder = new OnvifDiscovery({ localAddress });
    
        try {
            
            const cameras = await finder.find({timeout, logs});
    
            const results = new Map();
    
            for(const [ip, xml] of cameras) {

                //Extract data from xml
                const tree = XMLParser.parse(xml);

                const adressNodes = XMLParser.getNodes(tree, ({tag}) => tag.endsWith('XAddrs'));

                const address = adressNodes.map(node => node.children?.at(0)?.value).filter(Boolean);

                if(address.length > 0){

                    results.set(ip, address);
                }
            }
    
            return results;
        } 
        catch(error) {
            
            console.log(error);
        }
    },

    async findByScan(params) {
        
        const {
            scanner = {},
            timeout = 5000,
            logs = false
        } = params;

        const scannerInstance = new CameraScanner(scanner);

        try {
            
            let timeoutID = null;

            if(timeout > 0) timeoutID = setTimeout(() => scannerInstance.stop(), timeout);

            const cameras = await scannerInstance.scan({logs});

            if(timeoutID) clearTimeout(timeoutID);

            console.log(cameras);

            return cameras;
        }
        catch(error) {
            
            console.log(error);
        }
    }
};