
import { JsonWebKey } from '@transmute/json-web-signature';

export const verify = async (jws: string, publicKeyJwk: any) => {
    const k = await JsonWebKey.from({
        "type": "JsonWebKey2020",
        publicKeyJwk,
      } as any, {detached: false});
    const verifier = k.verifier();
    return verifier.verify({ signature: jws});
}