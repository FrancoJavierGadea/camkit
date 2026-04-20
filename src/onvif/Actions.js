

export const ONVIF_SOAP_ACTION = {

    // Device Service
    DEVICE: {
        GET_SERVICES: 'http://www.onvif.org/ver10/device/wsdl/GetServices',
        GET_CAPABILITIES: 'http://www.onvif.org/ver10/device/wsdl/GetCapabilities',
        GET_DEVICE_INFORMATION: 'http://www.onvif.org/ver10/device/wsdl/GetDeviceInformation',
        GET_SYSTEM_DATE_AND_TIME: 'http://www.onvif.org/ver10/device/wsdl/GetSystemDateAndTime',
        GET_HOSTNAME: 'http://www.onvif.org/ver10/device/wsdl/GetHostname',
        SET_SYSTEM_DATE_AND_TIME: 'http://www.onvif.org/ver10/device/wsdl/SetSystemDateAndTime',
    },

    // Media Service
    MEDIA: {
        GET_PROFILES: 'http://www.onvif.org/ver10/media/wsdl/GetProfiles',
        GET_PROFILE: 'http://www.onvif.org/ver10/media/wsdl/GetProfile',
        GET_STREAM_URI: 'http://www.onvif.org/ver10/media/wsdl/GetStreamUri',
        GET_SNAPSHOT_URI: 'http://www.onvif.org/ver10/media/wsdl/GetSnapshotUri',
        GET_VIDEO_ENCODER_CONFIGURATIONS: 'http://www.onvif.org/ver10/media/wsdl/GetVideoEncoderConfigurations',
    },

    // PTZ Service
    PTZ: {
        GET_STATUS: 'http://www.onvif.org/ver20/ptz/wsdl/GetStatus',
        CONTINUOUS_MOVE: 'http://www.onvif.org/ver20/ptz/wsdl/ContinuousMove',
        RELATIVE_MOVE: 'http://www.onvif.org/ver20/ptz/wsdl/RelativeMove',
        ABSOLUTE_MOVE: 'http://www.onvif.org/ver20/ptz/wsdl/AbsoluteMove',
        STOP: 'http://www.onvif.org/ver20/ptz/wsdl/Stop',
        GET_PRESETS: 'http://www.onvif.org/ver20/ptz/wsdl/GetPresets',
        GOTO_PRESET: 'http://www.onvif.org/ver20/ptz/wsdl/GotoPreset',
        SET_PRESET: 'http://www.onvif.org/ver20/ptz/wsdl/SetPreset',
        REMOVE_PRESET: 'http://www.onvif.org/ver20/ptz/wsdl/RemovePreset'
    }
};