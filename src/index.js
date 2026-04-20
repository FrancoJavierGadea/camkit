

import { CameraFinder } from "./CameraFinder/index.js";
import { OnvifDevice } from "./onvif/OnvifDevice.js";
import * as Extractors from "./extractors/index.js";


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





//console.log(JSON.stringify(results, null, 2));