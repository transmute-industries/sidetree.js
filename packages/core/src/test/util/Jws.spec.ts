import { Encoder, ErrorCode, SidetreeError } from '@sidetree/common';
import Jwk from '../../util/Jwk';
import Jws from '../../util/Jws';

describe('Jws', () => {
  describe('parseCompactJws()', () => {
    it('should throw error if given input to parse is not a string.', async () => {
      const anyObject = { a: 'abc' };

      expect(() => {
        Jws.parseCompactJws(anyObject);
      }).toThrow(new SidetreeError(ErrorCode.JwsCompactJwsNotString));
    });

    it('should throw error if given input string has more than 3 parts separated by a "." character.', async () => {
      const invalidCompactJwsString = 'aaa.bbb.ccc.ddd';

      expect(() => {
        Jws.parseCompactJws(invalidCompactJwsString);
      }).toThrow(new SidetreeError(ErrorCode.JwsCompactJwsInvalid));
    });

    it('should throw error if protected header contains unexpected property.', async () => {
      const [, signingPrivateKey] = await Jwk.generateEd25519KeyPair();

      const protectedHeader = {
        unknownProperty: 'anyValue',
        alg: 'EdDSA',
      };

      const payload = { anyProperty: 'anyValue' };

      const jws = await Jws.signAsCompactJws(
        payload,
        signingPrivateKey,
        protectedHeader
      );

      expect(() => {
        Jws.parseCompactJws(jws);
      }).toThrow(
        new SidetreeError(ErrorCode.JwsProtectedHeaderMissingOrUnknownProperty)
      );
    });

    it('should throw error if payload is not Base64URL string.', async () => {
      const protectedHeader = {
        alg: 'EdDSA',
      };
      const encodedProtectedHeader = Encoder.encode(
        JSON.stringify(protectedHeader)
      );

      const compactJws = Jws.createCompactJws(
        encodedProtectedHeader,
        '***InvalidPayloadString****',
        'anyValidBase64UrlStringAsSignature'
      );

      expect(() => {
        Jws.parseCompactJws(compactJws);
      }).toThrow(new SidetreeError(ErrorCode.JwsPayloadNotBase64UrlString));
    });

    it('should throw error if signature is not Base64URL string.', async () => {
      const protectedHeader = {
        alg: 'EdDSA',
      };
      const encodedProtectedHeader = Encoder.encode(
        JSON.stringify(protectedHeader)
      );

      const compactJws = Jws.createCompactJws(
        encodedProtectedHeader,
        'anyValidBase64UrlStringAsPayload',
        '***InvalidSignatureString****'
      );

      expect(() => {
        Jws.parseCompactJws(compactJws);
      }).toThrow(new SidetreeError(ErrorCode.JwsSignatureNotBase64UrlString));
    });
  });

  describe('verifyCompactJws()', () => {
    it('should return true if given compact JWS string has a valid signature.', async () => {
      const [publicKey, privateKey] = await Jwk.generateEd25519KeyPair();

      const payload = { abc: 'unused value' };
      const compactJws = await Jws.signAsCompactJws(payload, privateKey);

      expect(await Jws.verifyCompactJws(compactJws, publicKey)).toBeTruthy();
    });

    it('should return false if given compact JWS string has an ivalid signature.', async () => {
      const [publicKey1] = await Jwk.generateEd25519KeyPair();
      const [, privateKey2] = await Jwk.generateEd25519KeyPair();

      const payload = { abc: 'some value' };
      const compactJws = await Jws.signAsCompactJws(payload, privateKey2); // Intentionally signing with a different key.

      expect(await Jws.verifyCompactJws(compactJws, publicKey1)).toBeFalsy();
    });

    it('should return false if input is not a valid JWS string', async () => {
      const input = 'some invalid string';
      const [publicKey] = await Jwk.generateEd25519KeyPair();

      expect(await Jws.verifyCompactJws(input, publicKey)).toBeFalsy();
    });
  });
});
