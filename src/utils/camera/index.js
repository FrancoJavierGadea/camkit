import { CameraInfo } from "./CameraInfo.js";
import { XMLParser } from "../xml/XMLParser.js";
import { CameraFinder } from "./CameraFinder/OnvifDiscovery.js";


//MARK: findCameras
export async function findCamerasByBroadcast(params) {
    
    const {localAddress, timeout = 5000, logs = false} = params;

    const finder = new CameraFinder({ localAddress });

    try {
        
        const cameras = await finder.find({timeout, logs});

        const results = new Map();

        for(const [ip, xml] of cameras) {

            const address = await XMLParser.getTextValues(xml, (tag) => tag.endsWith('XAddrs'));

            results.set(ip, [...address.values()].at(0));
        }

        return results;
    } 
    catch(error) {
        
        console.log(error);
    }
}


//MARK: getDiviceInfo
export async function getDiviceInfo(params = {}){

    const {ip} = params;

    try {
        
        const camera = new CameraInfo({ ip });

        const xml = await camera.getDiviceInfo();

        const results = {};

        await XMLParser.scan(xml, {

            onText: (text, context) => {

                if(context.parent?.tag.endsWith('GetDeviceInformationResponse')){

                    ['Model', 'SerialNumber', 'FirmwareVersion'].forEach(tag => {

                        if(context.tag.endsWith(tag)){
                            results[tag] = text;
                        }
                    });
                }
            }
        });

        return results;
    } 
    catch (error) {
        
    }
}

//MARK: getCapabilities
export async function getCapabilities(params) {
    
    const {ip} = params;

    const camera = new CameraInfo({ ip });

    const xml = await camera.getCapabilities();

    const results = {
        divice: {}, 
        media: {supported: false}, 
        events: {supported: false}, 
        ptz: {supported: false}, 
        imaging: {supported: false}, 
        analitycs: {supported: false}, 
        deviceIO: {supported: false}
    };

    await XMLParser.scan(xml, {

        onText: (text, context) => {

            //Adress
            if(context.tag.endsWith('XAddr')){

                [
                    ['divice', 'Device'],
                    ['media', 'Media'],
                    ['events', 'Events'],
                    ['ptz', 'PTZ'],
                    ['imaging', 'Imaging'],
                    ['analitycs', 'Analytics'],
                    ['deviceIO', 'DeviceIO']
                ]
                .forEach(([key, tag]) => {

                    if(context.parent?.tag.endsWith(tag)){
                        results[key].xaddr = text;
                        if(key !== 'divice') results[key].supported = true;
                    }
                });
            }

            // Supported Versions
            if(context.parent?.tag.endsWith('SupportedVersions')) {

                results.divice.supportedVersions ??= [];
  
                if(context.tag.endsWith('Major')) results.divice.supportedVersions.push(text);

                if(context.tag.endsWith('Minor')) {

                    const major = results.divice.supportedVersions.pop();

                    results.divice.supportedVersions.push(`${major}.${text}`);
                }
            }

            // Streaming capabilities
            if(context.parent?.tag.endsWith('StreamingCapabilities')) {

                results.media.streaming ??= {};

                [
                    ['multicast', 'RTPMulticast'],
                    ['rtpTcp', 'RTP_TCP'],
                    ['rtpRtspTcp', 'RTP_RTSP_TCP']
                ]
                .forEach(([key, tag]) => {

                    if(context.tag.endsWith(tag)) results.media.streaming[key] = text.toLowerCase() === 'true';
                });
            }

        }
    });

    return results;
}


export async function getProfiles(params) {
    
    const {ip} = params;

    const camera = new CameraInfo({ ip });

    const xml = await camera.getProfiles();

    const results = new Map();

    //Extract data from XML
    const tree = XMLParser.parse(xml);

    const profiles = XMLParser.getNode(tree, ({tag}) =>  tag.endsWith('GetProfilesResponse'));

    console.log(profiles);

    if(profiles) {

        for(const profile of profiles.children) {

            if(profile.tag.endsWith('Profiles')){

                const token = profile.attrs.token;

                console.log(token);
            }
        }
    }

    return results;
}