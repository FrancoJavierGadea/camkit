
import { getCapabilities, getDiviceInfo, getProfiles } from "./utils/camera/index.js";
import { CameraFinder } from "./utils/camera/CameraFinder/index.js";

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





// const info = await getDiviceInfo({
//     ip: "192.168.100.234"
// });
//console.log(info);

// const capabilities = await getCapabilities({
//     ip: "192.168.100.234"
// });
// console.log(capabilities);


// const profiles = await getProfiles({
//     ip: CAMERA_IP
// });
// console.log(profiles);





//console.log(JSON.stringify(results, null, 2));