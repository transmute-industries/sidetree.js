import { toMnemonic } from './toMnemonic';
import { toKeyPair } from './toKeyPair';

export const toUniversalWalletDataModel = async (type: string, data: any) => {
  switch (type) {
    case 'Mnemonic': {
      return toMnemonic(data);
    }
    case 'KeyPair': {
      return toKeyPair(data);
    }
    default: {
      throw new Error('Unknown Universal Wallet Data Model Type; ' + type);
    }
  }
};
