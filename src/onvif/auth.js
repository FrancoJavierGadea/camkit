
import crypto from "node:crypto";


export class WSSecurity {

    static passwordDigest(password) {
    
        const nonce = crypto.randomBytes(16);
    
        const created = new Date().toISOString();
    
        const sha1 = crypto.createHash('sha1');
    
        sha1.update(
            Buffer.concat([nonce, Buffer.from(created), Buffer.from(password)])
        );
    
        return { 
            nonce: nonce.toString('base64'), 
            created, 
            passwordDigest: sha1.digest('base64') 
        };
    }

    username = null;
    #password = null;

    constructor(params = {}) {

        const {
            username,
            password,
        } = params;

        if(typeof username !== 'string') throw new Error('username is required');
        if(typeof password !== 'string') throw new Error('password is required');

        this.username = username;
        this.#password = password;
    }

    async send(params = {}) {

        const {url, body, SOAPAction, timeout = 3000} = params;

        const {nonce, created, passwordDigest} = WSSecurity.passwordDigest(this.#password);

        const envelope = /*xml*/`<?xml version="1.0" encoding="UTF-8"?>
        <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"
                    xmlns:tt="http://www.onvif.org/ver10/schema"
                    xmlns:tptz="http://www.onvif.org/ver20/ptz/wsdl"
                    xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
                    xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
            <s:Header>
                <wsse:Security s:mustUnderstand="1">
                <wsse:UsernameToken>
                    <wsse:Username>${this.username}</wsse:Username>
                    <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">${passwordDigest}</wsse:Password>
                    <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">${nonce}</wsse:Nonce>
                    <wsu:Created>${created}</wsu:Created>
                </wsse:UsernameToken>
                </wsse:Security>
            </s:Header>
            <s:Body>
                ${body}
            </s:Body>
        </s:Envelope>`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/soap+xml; charset=utf-8',
                    'Content-Length': Buffer.byteLength(envelope).toString(),
                    'Connection': 'close',
                    'SOAPAction': SOAPAction
                },
                body: envelope,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if(response.ok){
                
                const text = await response.text();
            }
        } 
        catch (error) {
            
        }
    }
}


export class HTTPDigestSecurity {



}