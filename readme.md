# camkit

> ONVIF camera toolkit for Node.js — stream, control and extract data from IP cameras

> ⚠️ This package is currently in **alpha**. The API may change without notice.

---

## Features

- 🎥 ONVIF protocol support
- 📡 Stream URI retrieval (RTSP)
- 🎛️ PTZ control (pan, tilt, zoom)
- 📋 Profile extraction and parsing
- 🔍 Camera discovery on local network
- 🧩 Lightweight XML parser — no dependencies

---

## Requirements

- Node.js >= 18.0.0
- ONVIF compatible IP camera

---

## Installation

```bash
npm install camkit@alpha
```

---

## Usage

```javascript
import { OnvifDevice } from 'camkit';

const device = new OnvifDevice({ ip: '192.168.1.100' });

const profiles = await device.getProfiles();
console.log(profiles);
```

---

## CLI

Find cameras on your local network:

```bash
npx find-camera
```

---

## License

MIT © Franco Javier Gadea