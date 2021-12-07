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
  createChunkFile: {
    cid: 'Qmaf1UJCsG7eC8cLbkRryBJbv8T7svzBG5r4ahXBVvWpXo',
    data: Buffer.from(
      '1f8b0800000000000003358f616f82301086ff4b3f8fa43825e83741d9a2228bca982e662947c50e8b150a0c88ff7d6d8cc97db97bdff7b9bb1e25f422498926df3daa44422475af9c33c9692ed104cdd93438b04d112cf8edb0357f5f71f8157ebcf94d54750573869eeff891b3b3079c8fdc06bd2041249ce9834740b26bae280515170254c9c915aa07ba47a28a2f0c96b47db859a29c254b7396a746465be596ada0fa08484ab2a52006232b333f69c14e0c8866abf0009b63bdf7095b34998667b2d549574950d49afcccabc99fea6f02cfbb0e86fbf3d41c5b6eb05f1263f35ea8ef0dbc4a3d393dd9dead865caeb14a685817411cc7e9b831b9315b076557fb96bd9be19fda7364d482696fb1053684ab10ddef475dc7fb3f393a288c61010000',
      'hex'
    ),
    json:
      '{"deltas":[{"updateCommitment":"EiAOZiRrOJmqZS1j30UXUPGMwWuzriB4FMBMWBT82mm5Cw","patches":[{"action":"replace","document":{"publicKeys":[{"id":"signing-key","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"qp0Ezzc4YhA196COYKa-RHrCom-0LgFtAf8FqvcntN0","y":"zWcbbbg9w1m-DNOszvM68TD0_vFBtWyc18S06c8cULU"}}]}}]}]}',
  },
  createProvisionalIndexFile: {
    cid: 'QmNwg5MrjFhGdPftqMTBYi5raYNuh122DjvYHAQUtrKx6Q',
    data: Buffer.from(
      '1f8b0800000000000003ab564ace28cdcb2e56b28aae8630dd327352438b3295ac94027313d30c43bd9c8bddcd539d2d927d92b2838a2a9dbc92ca2c42cc8bcbaa9cdc4d8b4c1233229cc2cac20b22f2956a636b015c0b64f84e000000',
      'hex'
    ),
    json:
      '{"chunks":[{"chunkFileUri":"Qmaf1UJCsG7eC8cLbkRryBJbv8T7svzBG5r4ahXBVvWpXo"}]}',
  },
  createCoreIndexFile: {
    cid: 'QmYtZhCUqbyvuQrjNHRtYvh2NRtog1xPfxsqC3AXDK8oen',
    data: Buffer.from(
      '1f8b080000000000000325cdc16e82300080e177e979878103851ba0885388202cb065592ab4a50c282b05bb11de7d18cf7ff2fd13e8381b694f590beb435b20e9d21a259c0213844d70239acf2bb7dc17672c7efcd8cea8c661160ca5a2aadb6acc3c2b4c043f4a3d044f80758843b1503d30279073040502e6c704fa01632ab750c07b28502da007fb7279eca8a39cf6b87c59bfdb69e546e9ee2458fbbae99c2bd173c3be0a2fb588a56ae3f91293e5c151ce46c47f1dd6345434a8150f65e57fa9c5e12db1d9b0d213031f633bd0fd3f435aaa9451a490defb769ed71be37203f3fc39cfff5b850a70fa000000',
      'hex'
    ),
    json:
      '{"provisionalIndexFileUri":"QmNwg5MrjFhGdPftqMTBYi5raYNuh122DjvYHAQUtrKx6Q","operations":{"create":[{"suffixData":{"deltaHash":"EiC1LGfh47ZBXjFRXELtonJ8pCbg6c9BbtHXAgA25vPSTg","recoveryCommitment":"EiC3M_2dIVUBou36U9fKTBN6Mz9xA2xxRR1gsHkC0789Sw"}}]}}',
  },
  recoverOperation: {
    cid: 'QmWA2bmcdTLAVDMjddeFJvw4fdxoNkJSUvUhKJiipPgP7R',
    data: Buffer.from(
      '1f8b08000000000000031d52c18eaa3000fc17ce2f2f1450176fae580497b20569a12f7b289495420183ae28c67f7fbad799c94c663277ad3f96033fcbbe3b69cbbb3694457f29076df9efae9de4a12b85c3cf5c5b6ae5cdaf72b790a1f4613279003527f98dff3ee186d1ab9e25555518875f9a27112f53ff1d37c0142e03598bdc3855ac545593ebf6885211e6135b23fa6604eef5c29303c04d651225224f8eb268499d9b4c159dfa606923c3ee24b919cdbcba975112c88fb55f175df6ca9a1845635027069f362fdc7a6942874da5c3668208466b1244f0082814168536149bf3904304b801ead8119825de84201a68426a76f34e5ed7fcfa1215cd895b91b2464ed4bc19c8103ddd120fa7648e0db62654ecb84e4cdab0e1d905073a9b50e78d5ea73f3d7c9519b6c1527f860dfb9c53a5e794fc88b537f71a728c363041ee55652db06213eec314def6200a99ae42def8806f3340129fc6a032331d61ac57b2540aa560f39a7cb46ba7b7aa614faef9caec570bbc9d67a1dcc7c1ec06bee7f6c2a917ade57c1eccb8caab7a67eec6b41db69b9f993ac2b4b8aee0bbb5a8a8ee82616a179f47d4daf988b5c7d71f4d94bc38cb0b3f97cf037c3d1eff01a01333901e020000',
      'hex'
    ),
    json:
      '{"operations":{"recover":[{"signedData":"eyJhbGciOiJFUzI1NksifQ.eyJkZWx0YUhhc2giOiJFaURaeXJBQk13dGZ1YmNGSXlZelhkb09wNXdObzZCNW82MGxvaUg1Qkh3VldRIiwicmVjb3ZlcnlLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoiODZzeDZ5dVdZWjVMRFp1WFd4WF9FdEtrbFN1a21jSDdQZUIzNFNrWUVjZyIsInkiOiJzVlR6VGhVejNDRk82N2doWHVIQXV6Q2ZCVWdKa0V3WkZrbzZQM0ZzNnIwIn0sInJlY292ZXJ5Q29tbWl0bWVudCI6IkVpREFUNGxlYm14S3FTOXFyT1ROZ0lOakJ1aHY1VUJWS1h3Y0NQQ0hiellNX1EifQ.w9jDo4hrTVxbA3oA7QH6YOiTSM5y1f697Dj7m4DPg3ShbhjK3KwXmrHEu5lpFXcxAFB47hW0G1rzm7PpNm9bwQ"}],"deactivate":[]}}',
  },
  recoverChunkFile: {
    cid: 'QmSWPef9rhcZm47PWcLkfL1262GEyFiHEyazi1SrecXZD6',
    data: Buffer.from(
      '1f8b080000000000000325cabb0ec2201400d07fb9734d7cc457376d7de2e0ac61b8c2ada585422c0ca4e1dfd5743bc3194092f6d843fe1cc0a117358d46e195ed20870f398d822003694530d479c87f35bcb4128ce27ff3947806c149f4545863941f1b1c54595e27fdb6b8376dbd8a785ea2bb5dd86376daacd9d4d5a1dd2f8eb68af3d0d0ee0d89a72f8125ee1690000000',
      'hex'
    ),
    json:
      '{"deltas":[{"patches":[{"action":"replace","document":{"publicKeys":[]}}],"updateCommitment":"EiDDJ-s9CPjkh6yaH5apLIKZ1G87K0phukB3Fofy2ujeAg"}]}',
  },
  recoverProvisionalIndexFile: {
    cid: 'QmP9u7Ar8jZq2Je6FcH5k7NGNTo3h1e2waWT5qjfX7hUob',
    data: Buffer.from(
      '1f8b0800000000000003ab564ace28cdcb2e56b28aae8630dd327352438b3295ac94027383c30352d32c8b3292a3724dcc03c2937db2d37c0c8dcc8cdc5d2bdd323d5c2b13ab320d838b529323a25ccc946a636b0163e9b8c34e000000',
      'hex'
    ),
    json:
      '{"chunks":[{"chunkFileUri":"QmSWPef9rhcZm47PWcLkfL1262GEyFiHEyazi1SrecXZD6"}]}',
  },
  recoverCoreIndexFile: {
    cid: 'QmTFzVs16FuPtzXK8NWqsvyNkUxd3bvqWf73UEa2YHhRzk',
    data: Buffer.from(
      '1f8b08000000000000034dcfcb6e82401840e17799b52e041174e7a5205028c8adb6690c323f38080c8e5c468cef5e926efa00e74bce13d58c76e44e6815177a8581aba4808011b4426ee92c5b79cd94fceb2618b05093bd74956dcdf6a9789981d0c7912fddf2f453be04f48c2688d6c0e266a4ee68f5440c12da0143abef27c2047b6d9a123eb26f64739aab6279ba0d52b3c187722b3789f5e11abc33bd87be1ddc79c01b25d17c5b0ab39165d0415c8471d1c25fbe53f910953c0bb5a5b79f3ac7e9f238c8e2745156ba0259f5a87d3e4bf3c2b4cc1ebd7e5e139450060ea334fd3f17ad85739960ff7d1deeac1c63508dae9fa79853fb6a7841175c4c8390dac91cf9805ebf1778a12e29010000',
      'hex'
    ),
    json:
      '{"provisionalIndexFileUri":"QmP9u7Ar8jZq2Je6FcH5k7NGNTo3h1e2waWT5qjfX7hUob","operations":{"recover":[{"didSuffix":"EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg","revealValue":"EiBDFxzWmxgVG9SH-PY-9Yz73-6mnI8egnypTx1fjlKMKw"}]},"coreProofFileUri":"QmWA2bmcdTLAVDMjddeFJvw4fdxoNkJSUvUhKJiipPgP7R"}',
  },
};

export const testBuffer = Buffer.from(
  '1f8b08000000000000034d91db6ee2301086dfc5d73dc5b4bb2d7729a5a1453408e8525a21e4d893c4cdc1966343bc28efbe362c6d255f8cfff9e7f3cc788f18949a34a8ffb1474632a26120aa8aeb0a6a8dfa68c8c3cdb9685e2c4e696ca2e8f760160f9377f5ccec34bca6365946b3ccacdab45d1457193a4392689ac39147a8e6a2761405b224145c9a096a8ee83d922629391d833dba3973ce866735af33273ab3b6127c0f9435640e54e29b5f45f007144f39251eed6cf82ab8f3cf9e58cfbbc2b30b6d7de5c0a5a8da7af0a9de29adbb7f62dc9b3d9a84f5a2e5e805bfc5f1b99e878b30d4e5fd2bbef91b4c8a16f7623adebcba0a0f63f3227f8b69c03f37ed232b96228f52939adbebc9f41ea623bb9a8c47692b57b1a1a8f31d29299ac32610313a7743ffefdaf148d380f2f104742e98ef924892f0926bfb546fc597f15b7e8012b2935c800d33057058e5ba5b9fb9f9d49653f8b9caa3f2c402dcfb5e66232a58f8f0ab64583329f8e1b773ad65d3bfbcdced76174695175454a85b77eeacbb7fdffa6cbc2a020000',
  'hex'
);
export const testString = 'anyCoreIndexFileBuffer';

export const testBufferHash = 'EiAuYMQ4_ZBO1ckbGpyyDKlcq8EFpG3duG3nkhR79RwFQQ';
export const testStringHash = 'EiBLkBZiYEmzDAD-CuMapW18cBaQr0un-cG0AjiLfdFhZA';
export const testObjectHash = 'EiAxghX7H2qN_c_wwt0GCcCVRt0JEhAPw3UoHS9JS-5cRg';
