

import { CameraFinder } from "./CameraFinder/index.js";
import { OnvifDevice } from "./onvif/OnvifDevice.js";
import * as Extractors from "./extractors/index.js";
import ONVIF_STREAM_PROTOCOL from "./onvif/constants/Protocols.js";


const HOST_IP = '192.168.100.188';
const CAMERA_IP = '192.168.100.236';


// const results = await CameraFinder.findByScan({
//     scanner: {
//         minX: 100,
//         maxX: 100,
//         minY: 1,
//         maxY: 254,
//         ip_base: '192.168'
//     },
//     timeout: 20000,
//     logs: true
// });
//console.log(results);

// const results = await CameraFinder.findByBroadcast({
//     localAddress: HOST_IP,
//     timeout: 10000,
//     logs: true
// });
// console.log(results);



const camera = new OnvifDevice({
    ip: CAMERA_IP
});


// const info = await Extractors.getDiviceInfo(camera);
// console.log(info);

// const capabilities = await Extractors.getCapabilities(camera);
// console.log(JSON.stringify(capabilities, null, 2));


const profiles = await Extractors.getProfiles(camera);
console.log(JSON.stringify([...profiles.values()], null, 2));

// const profileToken =  [...profiles.keys()].at(0);

// const streamUri = await Extractors.getStreamUri(camera, profileToken);
// console.log(streamUri);


for(const profile of profiles.values()) {
    
    if(profile.isSnapshot){
        const snapshotUri = await Extractors.getSnapshotUri(camera, profile.token);
        console.log(snapshotUri);
    }
    else {

        const streamUri = await Extractors.getStreamUri(camera, profile.token, {
            protocol: ONVIF_STREAM_PROTOCOL.HTTP
        });
        console.log(streamUri);
    }
}



//console.log(JSON.stringify(results, null, 2));