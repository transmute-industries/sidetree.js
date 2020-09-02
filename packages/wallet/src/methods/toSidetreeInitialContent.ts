import { toUniversalWalletDataModel } from './toUniversalWalletDataModel';
import { getLinkedDataKeyPairsAtIndex } from './getLinkedDataKeyPairsAtIndex';
import { getSidetreeUnanchoredContentFromLinkedDataKeyPair } from './getSidetreeUnanchoredContentFromLinkedDataKeyPair';

export const toSidetreeInitialContent = async (
  mnemonic: any,
  index: number = 0,
  didMethod = 'elem'
) => {
  const mnemonicContent = await toUniversalWalletDataModel(
    'Mnemonic',
    mnemonic
  );

  const [ed25519KeyPair, secp256k1KeyPair] = await getLinkedDataKeyPairsAtIndex(
    mnemonicContent,
    index
  );

  const ed25519WalletKeyPair = await toUniversalWalletDataModel(
    'KeyPair',
    ed25519KeyPair
  );
  ed25519WalletKeyPair.id = 'did:key:' + (await ed25519KeyPair.fingerprint());
  const secp256k1WalletKeyPair = await toUniversalWalletDataModel(
    'KeyPair',
    secp256k1KeyPair
  );
  secp256k1WalletKeyPair.id =
    'did:key:' + (await secp256k1KeyPair.fingerprint());

  const sidetreeContent = await getSidetreeUnanchoredContentFromLinkedDataKeyPair(
    secp256k1KeyPair,
    didMethod
  );

  const walletContents = [
    sidetreeContent,
    ed25519WalletKeyPair,
    secp256k1WalletKeyPair,
  ].map((content: any) => {
    return {
      ...content,
      // note the index that was used to generate this content
      generatedFrom: [mnemonicContent.id + '#/index/' + index],
      // note the controller of this content
      controller: content.id,
    };
  });

  return [mnemonicContent, ...walletContents];
};
