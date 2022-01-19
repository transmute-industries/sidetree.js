# Abstract

The purpose of this document is to create a list of policies for managing 
Ethereum that can be linked from other documents in this repository.

## Table of Contents

- Suggested Wallet
- Mnemonic Phrases and Private Keys
- Testnet Considerations
- Mainnet Considerations
- Separation of Funds
- Hot Wallet Considerations
- Situation Response
- Funding Wallets

## Suggested Wallet

We suggest using MetaMask.
A guide for how to create a MetaMask wallet and fund it with Testnet Ethereum can be
found [here](https://github.com/transmute-industries/sidetree.js/blob/main/packages/did-method-element/docs/local-element-ropsten-install.md#create-and-fund-a-wallet).

## Mnemonic Phrases and Private Keys

**MNEMONIC PHRASES WITH FUNDS OR WITH THE INTENTION OF HAVING FUNDS SHOULD NEVER BE SHARED (posted in slack, PM’d, emailed) OR OTHERWISE PUBLISHED FOR ANY REASON.**

**THE WHOLE CONCEPT OF CRYPTO IS TO CREATE A SECURE NETWORK FOR EXCHANGING COINS / TOKENS WITHOUT EXPOSING THE PRIVATE KEY, SO USE IT!!!! THE COST OF TRANSFERRING FUNDS BETWEEN DEVELOPERS IS GOING TO BE MUCH CHEAPER THAN ANY SITUATION RESPONSE.**

Note: This section in written in bolds / caps for emphasis.

## Testnet Considerations

With respect to posting phrases, the rule of thumb is that all funds should be considered mainnet funds and all funds should be treated as though they are personal funds. Something like 1 testnet ETH might not seem like a lot because it can be restored with a faucet, but in mainnet funds, that would be $4,000. The question you should ask yourself is: “would you be okay with losing $4,000?”

## Mainnet Considerations

🔥🔥🔥 **NEVER RE-USE A TESTNET ADDRESS OR MNEMONIC ON MAINNET** 🔥🔥🔥

Note: This section in written in bolds / caps for emphasis.

## Separation of Funds

Wallets that are connected to the internet are called "Hot Wallets."
Element nodes deployed on the public intetnet are "Hot Wallets."
Hot Wallets for Nodes should be minimally funded.
Developer and Cold funds should be separated from Hot Wallets.

## Hot Wallet Considerations

Hot Wallets are wallets connected to the internet and controlled by a program such as an Element node.

Each Hot Wallet MUST USE A UNIQUE MNEMONIC PHRASE.

Funds in the Hot Wallet SHOULD BE CONSIDERED BURNED (NON-RECOVERABLE) THE MOMENT THEY ARE TRANSFERRED TO THE WALLET. ONLY FUND WHAT YOU ARE WILLING TO USE.

Hot Wallet Recovery Phrases SHOULD NEVER BE SHARED TO ANYONE OUTSIDE OF SITUATIONS SUCH AS CONFIGURATION FILES.

In other words, once a hot wallet is deployed it should be assumed that the developer no longer has control over the wallet. It should only be considered as an address with an amount.

## Situation Response

In the case where a mnemonic phrase has been published or shared it should automatically be assumed to be compromised.

Any developer who sees that a mnemonic has been published should act immediately to attempt to recover the funds.

The first approach to recover the funds should be to use a secondary browser with Metamask to import the mnemonic phrase and then immediately attempt to send any funds in the wallet mainnet or testnet to the developer’s own wallet. Any transaction history associated with the wallet should be exported as a CSV.

Once all funds and the transaction history have been exported, a situation-analysis can be conducted
to address damages and what issues need to be addressed.

## Funding Wallets

In order to fund a wallet, a small test sum must be sent to the wallet then sent back to the sender to prove ownership of the wallet before any more funds can be transferred to that wallet. This applies to both testnet and mainnet for transferring funds to developer wallets.
