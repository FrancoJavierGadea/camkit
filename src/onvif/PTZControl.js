
import { ONVIF_SOAP_ACTION } from './constants/Actions.js';
import { WSSecurity } from './auth.js';


export class PTZControl {

    #controller = null;

    constructor(params = {}) {

        const {
            ip,
            port = 8899,
            path = '/onvif/ptz_service',
            profileToken = '000',
            timeout = 3000,
            logs = false,
            username,
            password,
        } = params;

        if(typeof ip !== 'string') throw new Error('ip is required');
        if(typeof username !== 'string') throw new Error('username is required');
        if(typeof password !== 'string') throw new Error('password is required');
        if(typeof profileToken !== 'string') throw new Error('profileToken is required');

        this.ip = ip;
        this.port = port;
        this.path = path;
        this.profileToken = profileToken;
        this.timeout = timeout;
        this.logs = logs;

        this.url = `http://${ip}:${port}${path}`;
  
        this.#controller = new WSSecurity({ username, password });
    }


    async move(params = {}) {

        if(typeof params.x !== 'number') throw new Error('x is required');
        if(typeof params.y !== 'number') throw new Error('y is required');

        const x = 0.5 * Math.sign(params.x);
        const y = 0.5 * Math.sign(params.y);

        const body = /*xml*/`<tptz:ContinuousMove>
            <tptz:ProfileToken>${params.profileToken ?? this.profileToken}</tptz:ProfileToken>
            <tptz:Velocity>
                <tt:PanTilt x="${x}" y="${y}" space="http://www.onvif.org/ver10/tptz/PanTiltSpaces/VelocityGenericSpace"/>
            </tptz:Velocity>
        </tptz:ContinuousMove>`;

        await this.#controller.send({
            url: this.url,
            body,
            SOAPAction: ONVIF_SOAP_ACTION.PTZ.CONTINUOUS_MOVE,
            timeout: this.timeout
        });
    }

    async stop(params = {}) {

        const body = /*xml*/`<tptz:Stop>
            <tptz:ProfileToken>${params.profileToken ?? this.profileToken}</tptz:ProfileToken>
            <tptz:PanTilt>true</tptz:PanTilt>
            <tptz:Zoom>true</tptz:Zoom>
        </tptz:Stop>`;

        await this.#controller.send({
            url: this.url,
            body,
            SOAPAction: ONVIF_SOAP_ACTION.PTZ.STOP,
            timeout: this.timeout
        }); 
    }


    async moveX(x = 1, profileToken) {
        return await this.move({x, y: 0, profileToken});
    }

    async moveY(y = 1, profileToken) {
        return await this.move({x: 0, y, profileToken});
    }

    async zoom(z = 1) {

    }

}