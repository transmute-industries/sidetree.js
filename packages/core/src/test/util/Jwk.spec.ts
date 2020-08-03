import { ErrorCode, SidetreeError } from '@sidetree/common';
import Jwk from '../../util/Jwk';

describe('Jwk', () => {
  describe('Ed25519 keys', () => {
    it('should generate generateEd25519KeyPair keypair', async () => {
      const [publicKey, privateKey] = await Jwk.generateEd25519KeyPair();
      expect(publicKey).toBeTruthy();
      expect(privateKey).toBeTruthy();
    });
  });

  describe('validateJwkCurve25519()', () => {
    it('should throw error if `undefined` is passed.', async () => {
      expect(() => {
        Jwk.validateJwkCurve25519(undefined);
      }).toThrow(new SidetreeError(ErrorCode.JwkCurve25519Undefined));
    });

    it('should throw error if un unknown property is included in the JWK.', async () => {
      const jwk = {
        unknownProperty: 'any value',
        crv: 'Ed25519',
        x: 'vcLqWyMCFAg8Wrbxu-p01-SG0ATO3rAKq3KobKUSsN8',
        kty: 'OKP',
        kid: 'ee5XJ8S-BMuvPFsk0GN-mkL3QEGoorgLbnMFIzXkUSE',
      };

      expect(() => {
        Jwk.validateJwkCurve25519(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkCurve25519HasUnknownProperty));
    });

    it('should throw error if JWK has the wrong `kty` value.', async () => {
      const jwk = {
        crv: 'Ed25519',
        x: 'vcLqWyMCFAg8Wrbxu-p01-SG0ATO3rAKq3KobKUSsN8',
        kty: 'WRONG_TYPE',
        kid: 'ee5XJ8S-BMuvPFsk0GN-mkL3QEGoorgLbnMFIzXkUSE',
      };

      expect(() => {
        Jwk.validateJwkCurve25519(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkCurve25519MissingOrInvalidKty));
    });

    it('should throw error if JWK has the wrong `crv` value.', async () => {
      const jwk = {
        crv: 'WRONG_CURVE',
        x: 'vcLqWyMCFAg8Wrbxu-p01-SG0ATO3rAKq3KobKUSsN8',
        kty: 'OKP',
        kid: 'ee5XJ8S-BMuvPFsk0GN-mkL3QEGoorgLbnMFIzXkUSE',
      };

      expect(() => {
        Jwk.validateJwkCurve25519(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkCurve25519MissingOrInvalidCrv));
    });

    it('should throw error if JWK has the wrong `x` type.', async () => {
      const jwk = {
        crv: 'Ed25519',
        x: 123,
        kty: 'OKP',
        kid: 'ee5XJ8S-BMuvPFsk0GN-mkL3QEGoorgLbnMFIzXkUSE',
      };

      expect(() => {
        Jwk.validateJwkCurve25519(jwk);
      }).toThrow(
        new SidetreeError(ErrorCode.JwkCurve25519MissingOrInvalidTypeX)
      );
    });
  });
});
