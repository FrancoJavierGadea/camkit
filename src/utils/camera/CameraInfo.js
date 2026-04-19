import { ONVIF_SOAP_ACTION } from "./onvif/Actions.js";

export class CameraInfo {

    static async onvifRequest(params = {}) {

        const {url, soapRequest, soapAction, timeout = 3000 } = params;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/soap+xml; charset=utf-8"
                },
                body: soapRequest,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if(response.ok) {
                return await response.text();
            }
        }
        catch (error) {
            return null;
        } 
    }


    constructor(params = {}){
        const {
            ip,
            port = 8899,
            timeout = 300
        } = params;

        this.ip = ip;
        this.port = port;
        this.timeout = timeout;
    }

    //MARK: DiviceInfo
    async getDiviceInfo(params = {}) {

        const {
            ip = this.ip,
            port = this.port,
            timeout = this.timeout,
            path = "/onvif/device_service"
        } = params;

        const url = `http://${ip}:${port}${path}`;

        const request = /*xml*/`
        <?xml version="1.0" encoding="utf-8"?>
        <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
            <s:Body>
                <GetDeviceInformation xmlns="http://www.onvif.org/ver10/device/wsdl"/>
            </s:Body>
        </s:Envelope>`;

        return await CameraInfo.onvifRequest({
            url,
            soapRequest: request,
            soapAction: ONVIF_SOAP_ACTION.DEVICE.GET_DEVICE_INFORMATION,
            timeout
        });
    }

    //MARK: Capabilities
    async getCapabilities(params = {}) {

        const {
            ip = this.ip,
            port = this.port,
            timeout = this.timeout,
            path = "/onvif/device_service"
        } = params;

        const url = `http://${ip}:${port}${path}`;

        const request = /*xml*/`
        <?xml version="1.0" encoding="utf-8"?>
        <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
        <s:Body>
            <GetCapabilities xmlns="http://www.onvif.org/ver10/device/wsdl">
            <Category>All</Category>
            </GetCapabilities>
        </s:Body>
        </s:Envelope>`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        return await CameraInfo.onvifRequest({
            url,
            soapRequest: request,
            soapAction: ONVIF_SOAP_ACTION.DEVICE.GET_CAPABILITIES,
            timeout
        });
    }

    //Profiles
    async getProfiles(params = {}) {

        const {
            ip = this.ip,
            port = this.port,
            timeout = this.timeout,
            path = "/onvif/device_service"
        } = params;

        const url = `http://${ip}:${port}${path}`;

        const soapRequest = /*xml*/`
        <?xml version="1.0" encoding="UTF-8"?>
        <soap:Envelope
            xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
            xmlns:trt="http://www.onvif.org/ver10/media/wsdl">
            <soap:Body>
                <trt:GetProfiles/>
            </soap:Body>
        </soap:Envelope>
        `

        return await CameraInfo.onvifRequest({
            url,
            soapRequest,
            soapAction: ONVIF_SOAP_ACTION.MEDIA.GET_PROFILES,
            timeout
        });
    }
}