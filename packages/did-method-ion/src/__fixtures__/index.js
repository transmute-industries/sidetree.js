const recoverPrivateKeyJwk = require('./EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA-RecoveryPrivateKey.json');
const updatePrivateKeyJwk = require('./EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA-UpdatePrivateKey.json');
const signingPrivateKeyJwk = require('./EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA-SigningPrivateKey.json');
const createOperation = require('./EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA-CreateOperation.json');
const longFormDid = require('./EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA-LongFormDid.json');

const ipfsReadme = `Hello and Welcome to IPFS!

██╗██████╗ ███████╗███████╗
██║██╔══██╗██╔════╝██╔════╝
██║██████╔╝█████╗  ███████╗
██║██╔═══╝ ██╔══╝  ╚════██║
██║██║     ██║     ███████║
╚═╝╚═╝     ╚═╝     ╚══════╝

If you're seeing this, you have successfully installed
IPFS and are now interfacing with the ipfs merkledag!

 -------------------------------------------------------
| Warning:                                              |
|   This is alpha software. Use at your own discretion! |
|   Much is missing or lacking polish. There are bugs.  |
|   Not yet secure. Read the security notes for more.   |
 -------------------------------------------------------

Check out some of the other files in this directory:

  ./about
  ./help
  ./quick-start     <-- usage examples
  ./readme          <-- this file
  ./security-notes
`;

const bitcoindError = `Error: Command failed: bitcoin-core.cli getnetworkinfo
error: timeout on transient error: Could not connect to the server 127.0.0.1:18443

Make sure the bitcoind server is running and that you are connecting to the correct RPC port.
`;

const createOperationResponse = `{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"id":"did:ion:EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA","@context":["https://www.w3.org/ns/did/v1",{"@base":"did:ion:EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA"}],"verificationMethod":[{"id":"#signing-key","controller":"","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"qp0Ezzc4YhA196COYKa-RHrCom-0LgFtAf8FqvcntN0","y":"zWcbbbg9w1m-DNOszvM68TD0_vFBtWyc18S06c8cULU"}}]},"didDocumentMetadata":{"method":{"published":false,"recoveryCommitment":"EiC3M_2dIVUBou36U9fKTBN6Mz9xA2xxRR1gsHkC0789Sw","updateCommitment":"EiAOZiRrOJmqZS1j30UXUPGMwWuzriB4FMBMWBT82mm5Cw"},"canonicalId":"did:ion:EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA"}}`;

const resolveOperationResponse = `{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"id":"did:ion:EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA","@context":["https://www.w3.org/ns/did/v1",{"@base":"did:ion:EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA"}],"verificationMethod":[{"id":"#signing-key","controller":"","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"qp0Ezzc4YhA196COYKa-RHrCom-0LgFtAf8FqvcntN0","y":"zWcbbbg9w1m-DNOszvM68TD0_vFBtWyc18S06c8cULU"}}]},"didDocumentMetadata":{"method":{"published":true,"recoveryCommitment":"EiC3M_2dIVUBou36U9fKTBN6Mz9xA2xxRR1gsHkC0789Sw","updateCommitment":"EiAOZiRrOJmqZS1j30UXUPGMwWuzriB4FMBMWBT82mm5Cw"},"canonicalId":"did:ion:EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA"}}`;

module.exports = {
  recoverPrivateKeyJwk,
  updatePrivateKeyJwk,
  signingPrivateKeyJwk,
  createOperation,
  longFormDid,
  ipfsReadme,
  bitcoindError,
  createOperationResponse,
  resolveOperationResponse,
};
