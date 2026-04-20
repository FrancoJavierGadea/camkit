import XMLParser from "../utils/xml/XMLParser.js";
import { Tag } from "../utils/xml/nodesUtils.js";
import { Cast } from "../utils/xml/ObjectUtils.js";


export async function getProfiles(onvifDevice, params = {}) {
    
    const xml = await onvifDevice.getProfiles();

    //Extract data from XML
    const results = new Map();

    const tree = XMLParser.parse(xml);

    const profiles = XMLParser.getNodes(tree, Tag.endsWith('Profiles'));

    for(const profile of profiles) {

        //Extract data from xml
        const result = {};

        //Profile identifier and name
        result.token = profile.attrs.token;
        result.name = XMLParser.getText(profile, Tag.endsWith('Name'));

        //Video Source
        const videoSourceBounds = XMLParser.getAttrs(profile, Tag.endsWith('VideoSourceConfiguration'), Tag.endsWith('Bounds'));
        result.videoSource = {
            bounds: Cast.toNumber(videoSourceBounds)
        };
        
        //Video Encoder
        const videoEncoder = XMLParser.getNode(profile, Tag.endsWith('VideoEncoderConfiguration'));

        result.videoEncoder = Cast.toNumber({
            name: XMLParser.getText(videoEncoder, Tag.endsWith('Name')),
            encoding: XMLParser.getText(videoEncoder, Tag.endsWith('Encoding')),
            quality: XMLParser.getText(videoEncoder, Tag.endsWith('Quality')),
            sessionTimeout: XMLParser.getText(videoEncoder, Tag.endsWith('SessionTimeout'))
        }, 'quality');

        const resolution = XMLParser.getNode(videoEncoder, Tag.endsWith('Resolution'));

        result.videoEncoder.resolution = Cast.toNumber({
            width: XMLParser.getText(resolution, Tag.endsWith('Width')),
            height: XMLParser.getText(resolution, Tag.endsWith('Height'))
        });

        const rateControl = XMLParser.getNode(videoEncoder, Tag.endsWith('RateControl'));

        result.videoEncoder.rateControl = Cast.toNumber({
            frameRateLimit: XMLParser.getText(rateControl, Tag.endsWith('FrameRateLimit')),
            bitRateLimit: XMLParser.getText(rateControl, Tag.endsWith('BitrateLimit')),
        });

        //Audio Encoder
        const audioEncoder = XMLParser.getNode(profile, Tag.endsWith('AudioEncoderConfiguration'));

        if(audioEncoder){
            result.audioEncoder = Cast.toNumber({
                name: XMLParser.getText(audioEncoder, Tag.endsWith('Name')),
                encoding: XMLParser.getText(audioEncoder, Tag.endsWith('Encoding')),
                bitrate: XMLParser.getText(audioEncoder, Tag.endsWith('Bitrate')),
                sampleRate: XMLParser.getText(audioEncoder, Tag.endsWith('SampleRate')),
            }, 'bitrate', 'sampleRate')
        }

        //PTZ
        const ptz = XMLParser.getNode(profile, Tag.endsWith('PTZConfiguration'));

        if(ptz){
            result.ptz = {
                token: ptz.attrs.token,
                name: XMLParser.getText(ptz, Tag.endsWith('Name')),
                nodeToken: XMLParser.getText(ptz, Tag.endsWith('NodeToken')),
            };

            //PTZ Limits
            const panTiltLimits = XMLParser.getNode(ptz, Tag.endsWith('PanTiltLimits'));

            result.ptz.panTiltLimits = {
                XRange: Cast.toNumber({
                    min: XMLParser.getText(panTiltLimits, Tag.endsWith('XRange'), Tag.endsWith('Min')),
                    max: XMLParser.getText(panTiltLimits, Tag.endsWith('XRange'), Tag.endsWith('Max'))
                }),
                YRange: Cast.toNumber({
                    min: XMLParser.getText(panTiltLimits, Tag.endsWith('YRange'), Tag.endsWith('Min')),
                    max: XMLParser.getText(panTiltLimits, Tag.endsWith('YRange'), Tag.endsWith('Max'))
                })
            };

            const zoomLimits = XMLParser.getNode(ptz, Tag.endsWith('ZoomLimits'));

            result.ptz.zoomLimits = Cast.toNumber({
                min: XMLParser.getText(zoomLimits, Tag.endsWith('XRange'), Tag.endsWith('Min')),
                max: XMLParser.getText(zoomLimits, Tag.endsWith('XRange'), Tag.endsWith('Max'))
            });

            //Default PTZ Speed
            const defaultPTZSpeed = {
                panTilt: XMLParser.getAttrs(ptz, Tag.endsWith('DefaultPTZSpeed'), Tag.endsWith('PanTilt')),
                zoom: XMLParser.getAttrs(ptz, Tag.endsWith('DefaultPTZSpeed'), Tag.endsWith('Zoom'))
            };

            result.ptz.defaultPTZSpeed = {
                panTilt: Cast.toNumber({
                    x: defaultPTZSpeed.panTilt.x,
                    y: defaultPTZSpeed.panTilt.y
                }),
                zoom: Cast.toNumber({
                    x: defaultPTZSpeed.zoom.x,
                })
            };
        }
            
        results.set(result.token, result);
    }
    
    return results;
}