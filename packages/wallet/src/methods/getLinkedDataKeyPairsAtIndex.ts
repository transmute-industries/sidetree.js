import { getEd25519KeyPairFromMnemonicAtIndex } from './getEd25519KeyPairFromMnemonicAtIndex';
import { getSecp256k1KeyPairFromMnemonicAtIndex } from './getSecp256k1KeyPairFromMnemonicAtIndex';

export const getLinkedDataKeyPairsAtIndex = async (
  mnemonicContent: any,
  index: number
): Promise<any> => {
  const ed25519KeyPair = await getEd25519KeyPairFromMnemonicAtIndex(
    mnemonicContent,
    index
  );
  const secp256k1KeyPair = await getSecp256k1KeyPairFromMnemonicAtIndex(
    mnemonicContent,
    index
  );
  return [ed25519KeyPair, secp256k1KeyPair];
};
