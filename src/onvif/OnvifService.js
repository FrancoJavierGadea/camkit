

export class OnvifService {

    static defaults = {
        port: 8899,
        timeout: 3000,
        https: false
    }

    constructor(params = {}) {

        Object.assign(this, OnvifService.defaults, params);
    }

    buildUrl(path, params = {}) { 

        const ip = params.ip ?? this.ip;
        const port = params.port ?? this.port;
        const https = params.https ?? this.https;

        if(path.startsWith('/')) path = path.slice(1);

        return https ? `https://${ip}:${port}/${path}` : `http://${ip}:${port}/${path}`;
    }

    async request(params = {}){ 

        const {
            url,
            soapRequest,
            soapAction,
            timeout = this.timeout
        } = params;

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
        finally {
            clearTimeout(timeoutId);
        } 
    }
}

export default OnvifService;