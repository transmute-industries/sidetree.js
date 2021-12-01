/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
 *
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Test Vectors were taken from Sidetree's BatchWriter test to insure compatibility.
 * https://github.com/decentralized-identity/sidetree/blob/master/tests/core/BatchWriter.spec.ts
 *
 * Test Buffer was taken from test:
 * 'should return without writing anything if operation queue is empty.'
 *
 * Test String was taken from test:
 * 'should pass the writer lock ID to CoreIndexFile.createBuffer() if a value lock exists.'
 *
 * By Logging the values passed into the MockCas write function during the test
 * https://github.com/decentralized-identity/sidetree/blob/master/tests/mocks/MockCas.ts#L34
 */

export const ionVectors = {
	chunkFile : {
		cid : 'Qmaf1UJCsG7eC8cLbkRryBJbv8T7svzBG5r4ahXBVvWpXo',
		data : Buffer.from('1f8b0800000000000003358f616f82301086ff4b3f8fa43825e83741d9a2228bca982e662947c50e8b150a0c88ff7d6d8cc97db97bdff7b9bb1e25f422498926df3daa44422475af9c33c9692ed104cdd93438b04d112cf8edb0357f5f71f8157ebcf94d54750573869eeff891b3b3079c8fdc06bd2041249ce9834740b26bae280515170254c9c915aa07ba47a28a2f0c96b47db859a29c254b7396a746465be596ada0fa08484ab2a52006232b333f69c14e0c8866abf0009b63bdf7095b34998667b2d549574950d49afcccabc99fea6f02cfbb0e86fbf3d41c5b6eb05f1263f35ea8ef0dbc4a3d393dd9dead865caeb14a685817411cc7e9b831b9315b076557fb96bd9be19fda7364d482696fb1053684ab10ddef475dc7fb3f393a288c61010000', 'hex'),
		json : '{"deltas":[{"updateCommitment":"EiAOZiRrOJmqZS1j30UXUPGMwWuzriB4FMBMWBT82mm5Cw","patches":[{"action":"replace","document":{"publicKeys":[{"id":"signing-key","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"qp0Ezzc4YhA196COYKa-RHrCom-0LgFtAf8FqvcntN0","y":"zWcbbbg9w1m-DNOszvM68TD0_vFBtWyc18S06c8cULU"}}]}}]}]}'
	},
	provisionalIndexFile : {
		cid : 'QmNwg5MrjFhGdPftqMTBYi5raYNuh122DjvYHAQUtrKx6Q',
		data : Buffer.from('1f8b0800000000000003ab564ace28cdcb2e56b28aae8630dd327352438b3295ac94027313d30c43bd9c8bddcd539d2d927d92b2838a2a9dbc92ca2c42cc8bcbaa9cdc4d8b4c1233229cc2cac20b22f2956a636b015c0b64f84e000000', 'hex'),
		json : '{"chunks":[{"chunkFileUri":"Qmaf1UJCsG7eC8cLbkRryBJbv8T7svzBG5r4ahXBVvWpXo"}]}'
	},
	coreIndexFile : {
		cid : 'QmYtZhCUqbyvuQrjNHRtYvh2NRtog1xPfxsqC3AXDK8oen',
		data : Buffer.from('1f8b080000000000000325cdc16e82300080e177e979878103851ba0885388202cb065592ab4a50c282b05bb11de7d18cf7ff2fd13e8381b694f590beb435b20e9d21a259c0213844d70239acf2bb7dc17672c7efcd8cea8c661160ca5a2aadb6acc3c2b4c043f4a3d044f80758843b1503d30279073040502e6c704fa01632ab750c07b28502da007fb7279eca8a39cf6b87c59bfdb69e546e9ee2458fbbae99c2bd173c3be0a2fb588a56ae3f91293e5c151ce46c47f1dd6345434a8150f65e57fa9c5e12db1d9b0d213031f633bd0fd3f435aaa9451a490defb769ed71be37203f3fc39cfff5b850a70fa000000', 'hex'),
		json : '{"provisionalIndexFileUri":"QmNwg5MrjFhGdPftqMTBYi5raYNuh122DjvYHAQUtrKx6Q","operations":{"create":[{"suffixData":{"deltaHash":"EiC1LGfh47ZBXjFRXELtonJ8pCbg6c9BbtHXAgA25vPSTg","recoveryCommitment":"EiC3M_2dIVUBou36U9fKTBN6Mz9xA2xxRR1gsHkC0789Sw"}}]}}'
	}
}

export const testBuffer = Buffer.from(
  '1f8b08000000000000034d91db6ee2301086dfc5d73dc5b4bb2d7729a5a1453408e8525a21e4d893c4cdc1966343bc28efbe362c6d255f8cfff9e7f3cc788f18949a34a8ffb1474632a26120aa8aeb0a6a8dfa68c8c3cdb9685e2c4e696ca2e8f760160f9377f5ccec34bca6365946b3ccacdab45d1457193a4392689ac39147a8e6a2761405b224145c9a096a8ee83d922629391d833dba3973ce866735af33273ab3b6127c0f9435640e54e29b5f45f007144f39251eed6cf82ab8f3cf9e58cfbbc2b30b6d7de5c0a5a8da7af0a9de29adbb7f62dc9b3d9a84f5a2e5e805bfc5f1b99e878b30d4e5fd2bbef91b4c8a16f7623adebcba0a0f63f3227f8b69c03f37ed232b96228f52939adbebc9f41ea623bb9a8c47692b57b1a1a8f31d29299ac32610313a7743ffefdaf148d380f2f104742e98ef924892f0926bfb546fc597f15b7e8012b2935c800d33057058e5ba5b9fb9f9d49653f8b9caa3f2c402dcfb5e66232a58f8f0ab64583329f8e1b773ad65d3bfbcdced76174695175454a85b77eeacbb7fdffa6cbc2a020000',
  'hex'
);
export const testString = 'anyCoreIndexFileBuffer';

export const testBufferHash = 'EiAuYMQ4_ZBO1ckbGpyyDKlcq8EFpG3duG3nkhR79RwFQQ';
export const testStringHash = 'EiBLkBZiYEmzDAD-CuMapW18cBaQr0un-cG0AjiLfdFhZA';
export const testObjectHash = 'EiAxghX7H2qN_c_wwt0GCcCVRt0JEhAPw3UoHS9JS-5cRg';
