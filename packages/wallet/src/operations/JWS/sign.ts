import { Secp256k1KeyPair } from '@transmute/secp256k1-key-pair';
import { Ed25519KeyPair } from '@transmute/ed25519-key-pair';
import { JWS } from '@transmute/jose-ld';

export const sign = async (header: any, payload: any, privateKeyJwk: any) => {
  let signer: any;

  const publicKeyJwk = { ...privateKeyJwk };
  delete publicKeyJwk.d;

  if (privateKeyJwk.crv === 'secp256k1') {
    const k = await Secp256k1KeyPair.from({
      type: 'JsonWebKey2020',
      publicKeyJwk,
      privateKeyJwk,
    } as any);
    signer = JWS.createSigner(k.signer(), 'ES256K', {
      detached: false,
      header,
    });
  }

  if (privateKeyJwk.crv === 'Ed25519') {
    const k = await Ed25519KeyPair.from({
      type: 'JsonWebKey2020',
      publicKeyJwk,
      privateKeyJwk,
    } as any);
    signer = JWS.createSigner(k.signer(), 'EdDSA', { detached: false, header });
  }
  if (!signer) {
    throw new Error(
      'Unable to parse ' + JSON.stringify(privateKeyJwk, null, 2)
    );
  }

  const message = Uint8Array.from(Buffer.from(JSON.stringify(payload)));
  const signature = await signer.sign({ data: message });
  return signature;
};
