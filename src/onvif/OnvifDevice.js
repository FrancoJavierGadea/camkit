import OnvifService from "./OnvifService.js";
import { ONVIF_SOAP_ACTION } from "./Actions.js";


export class OnvifDevice extends OnvifService {

    static defaults = {
        path: "/onvif/device_service"
    }

    constructor(params = {}){
        super(params);

        Object.assign(this, OnvifDevice.defaults, params);
    }

    buildRequest(params = {}){
        return {
            ip: params.ip ?? this.ip,
            port: params.port ?? this.port,
            timeout: params.timeout ?? this.timeout,
            path: params.path ?? this.path,
        }
    }

    //MARK: DiviceInfo
    async getDiviceInfo(params = {}) {

        const { ip, port, timeout, path } = this.buildRequest(params);

        const url = this.buildUrl(path, {ip, port});

        const request = /*xml*/`
        <?xml version="1.0" encoding="utf-8"?>
        <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
            <s:Body>
                <GetDeviceInformation xmlns="http://www.onvif.org/ver10/device/wsdl"/>
            </s:Body>
        </s:Envelope>`;

        return await this.request({
            url,
            soapRequest: request,
            soapAction: ONVIF_SOAP_ACTION.DEVICE.GET_DEVICE_INFORMATION,
            timeout
        });
    }

    //MARK: Capabilities
    async getCapabilities(params = {}) {

        const { ip, port, timeout, path } = this.buildRequest(params);

        const url = this.buildUrl(path, {ip, port});

        const request = /*xml*/`
        <?xml version="1.0" encoding="utf-8"?>
        <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
        <s:Body>
            <GetCapabilities xmlns="http://www.onvif.org/ver10/device/wsdl">
            <Category>All</Category>
            </GetCapabilities>
        </s:Body>
        </s:Envelope>`;

        return await this.request({
            url,
            soapRequest: request,
            soapAction: ONVIF_SOAP_ACTION.DEVICE.GET_CAPABILITIES,
            timeout
        });
    }

    //Profiles
    async getProfiles(params = {}) {

        const { ip, port, timeout, path } = this.buildRequest(params);

        const url = this.buildUrl(path, {ip, port});

        const soapRequest = /*xml*/`
        <?xml version="1.0" encoding="UTF-8"?>
        <soap:Envelope
            xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
            xmlns:trt="http://www.onvif.org/ver10/media/wsdl">
            <soap:Body>
                <trt:GetProfiles/>
            </soap:Body>
        </soap:Envelope>
        `;

        return await this.request({
            url,
            soapRequest,
            soapAction: ONVIF_SOAP_ACTION.MEDIA.GET_PROFILES,
            timeout
        });
    }
}

export default OnvifDevice;