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

module.exports = {
  recoverPrivateKeyJwk,
  updatePrivateKeyJwk,
  signingPrivateKeyJwk,
  createOperation,
  longFormDid,
  ipfsReadme,
  bitcoindError,
};
