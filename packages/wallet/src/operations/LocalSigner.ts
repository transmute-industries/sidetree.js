import { ISigner } from '@decentralized-identity/ion-sdk';

import { OperationKeyType } from './types';
import InputValidator from './InputValidator';

import { sign } from './JWS';

type PrivateKeyJwk = any;

/**
 * An ISigner implementation that uses a given local private key.
 */
export default class LocalSigner implements ISigner {
  /**
   * Creates a new local signer using the given private key.
   */
  public static create(privateKey: PrivateKeyJwk): ISigner {
    return new LocalSigner(privateKey);
  }

  private constructor(private privateKey: PrivateKeyJwk) {
    InputValidator.validateOperationKey(privateKey, OperationKeyType.Private);
  }

  public async sign(header: object, content: object): Promise<string> {
    const compactJws = await sign(header, content, this.privateKey);
    return compactJws;
  }
}
