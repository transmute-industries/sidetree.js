

import { JsonWebKey } from '@transmute/json-web-signature';

export const sign = async(header: any, payload: any, privateKeyJwk:any) => {
    const publicKeyJwk = { ...privateKeyJwk };
    delete publicKeyJwk.d;
    const k = await JsonWebKey.from({
        "type": "JsonWebKey2020",
        publicKeyJwk,
        privateKeyJwk
      } as any, {
        detached: false,
        header
    });
    const signer = k.signer();
    const compactJws = await signer.sign({ data: payload });
    return compactJws;
}