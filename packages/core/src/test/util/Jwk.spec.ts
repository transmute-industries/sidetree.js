import { ErrorCode, SidetreeError } from '@sidetree/common';
import Jwk from '../../util/Jwk';

describe('Jwk', () => {
  describe('Ed25519 keys', () => {
    it('should generate Ed25519 keypair', async () => {
      const [publicKey, privateKey] = await Jwk.generateEd25519KeyPair();
      expect(publicKey).toBeDefined();
      expect(publicKey.crv).toBe('Ed25519');
      expect(privateKey).toBeDefined();
      expect(privateKey.crv).toBe('Ed25519');
    });

    it('should be valid JWK', async () => {
      const [publicKey] = await Jwk.generateEd25519KeyPair();
      expect(() => Jwk.validatePublicJwk(publicKey)).not.toThrow();
    });
  });

  describe('Secp256k1 keys', () => {
    it('should generate Secp256K1 keypair', async () => {
      const [publicKey, privateKey] = await Jwk.generateEs256kKeyPair();
      expect(publicKey).toBeDefined();
      expect(publicKey.crv).toBe('secp256k1');
      expect(privateKey).toBeDefined();
      expect(privateKey.crv).toBe('secp256k1');
    });

    it('should be valid JWK', async () => {
      const [publicKey] = await Jwk.generateEs256kKeyPair();
      expect(() => Jwk.validatePublicJwk(publicKey)).not.toThrow();
    });
  });

  describe('validatePublicJwk()', () => {
    it('should throw error if `undefined` is passed.', async () => {
      expect(() => {
        Jwk.validatePublicJwk(undefined);
      }).toThrow(new SidetreeError(ErrorCode.JwkUndefined));
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
        Jwk.validatePublicJwk(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkHasUnknownProperty));
    });

    it('should throw error if JWK has the wrong `kty` value.', async () => {
      const jwk = {
        crv: 'Ed25519',
        x: 'vcLqWyMCFAg8Wrbxu-p01-SG0ATO3rAKq3KobKUSsN8',
        kty: 'WRONG_TYPE',
        kid: 'ee5XJ8S-BMuvPFsk0GN-mkL3QEGoorgLbnMFIzXkUSE',
      };

      expect(() => {
        Jwk.validatePublicJwk(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkMissingOrInvalidKty));
    });

    it('should throw error if JWK has the wrong `crv` value.', async () => {
      const jwk = {
        crv: 'WRONG_CURVE',
        x: 'vcLqWyMCFAg8Wrbxu-p01-SG0ATO3rAKq3KobKUSsN8',
        kty: 'OKP',
        kid: 'ee5XJ8S-BMuvPFsk0GN-mkL3QEGoorgLbnMFIzXkUSE',
      };

      expect(() => {
        Jwk.validatePublicJwk(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkMissingOrInvalidCrv));
    });

    it('should throw error if JWK has the wrong `x` type.', async () => {
      const jwk = {
        crv: 'Ed25519',
        x: 123,
        kty: 'OKP',
        kid: 'ee5XJ8S-BMuvPFsk0GN-mkL3QEGoorgLbnMFIzXkUSE',
      };

      expect(() => {
        Jwk.validatePublicJwk(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkMissingOrInvalidTypeX));
    });

    it('should throw error if JWK has the wrong `kid` value', async () => {
      const jwk = {
        crv: 'Ed25519',
        x: 'vcLqWyMCFAg8Wrbxu-p01-SG0ATO3rAKq3KobKUSsN8',
        kty: 'OKP',
        kid: 123,
      };

      expect(() => {
        Jwk.validatePublicJwk(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkMissingOrInvalidKid));
    });
  });
});
