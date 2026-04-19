
import { findCamerasByIP } from "./utils/camera/CameraFinder/findCamerasByIP.js";
import { findCamerasByBroadcast, getCapabilities, getDiviceInfo, getProfiles } from "./utils/camera/index.js";


// const results = await findCamerasByIP({
//     minX: 90,
//     maxX: 120,
//     minY: 1,
//     maxY: 254,
//     ip_base: "192.168",
// });

// const results = await findCamerasByBroadcast({
//     localAddress: "192.168.100.188",
//     timeout: 10000,
//     logs: true
// });


const IP = '192.168.100.236';


// const info = await getDiviceInfo({
//     ip: "192.168.100.234"
// });
//console.log(info);

// const capabilities = await getCapabilities({
//     ip: "192.168.100.234"
// });
// console.log(capabilities);


const profiles = await getProfiles({
    ip: IP
});
console.log(profiles);





//console.log(JSON.stringify(results, null, 2));