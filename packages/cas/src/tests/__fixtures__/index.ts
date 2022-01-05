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

interface DataSample {
  cid: string;
  content: Buffer;
  jsonStr: string;
}

export const ionVectors: { [key: string]: DataSample } = {
  createChunkFile: {
    cid: 'Qmaf1UJCsG7eC8cLbkRryBJbv8T7svzBG5r4ahXBVvWpXo',
    content: Buffer.from(
      '1f8b0800000000000003358f616f82301086ff4b3f8fa43825e83741d9a2228bca982e662947c50e8b150a0c88ff7d6d8cc97db97bdff7b9bb1e25f422498926df3daa44422475af9c33c9692ed104cdd93438b04d112cf8edb0357f5f71f8157ebcf94d54750573869eeff891b3b3079c8fdc06bd2041249ce9834740b26bae280515170254c9c915aa07ba47a28a2f0c96b47db859a29c254b7396a746465be596ada0fa08484ab2a52006232b333f69c14e0c8866abf0009b63bdf7095b34998667b2d549574950d49afcccabc99fea6f02cfbb0e86fbf3d41c5b6eb05f1263f35ea8ef0dbc4a3d393dd9dead865caeb14a685817411cc7e9b831b9315b076557fb96bd9be19fda7364d482696fb1053684ab10ddef475dc7fb3f393a288c61010000',
      'hex'
    ),
    jsonStr:
      '{"deltas":[{"updateCommitment":"EiAOZiRrOJmqZS1j30UXUPGMwWuzriB4FMBMWBT82mm5Cw","patches":[{"action":"replace","document":{"publicKeys":[{"id":"signing-key","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"qp0Ezzc4YhA196COYKa-RHrCom-0LgFtAf8FqvcntN0","y":"zWcbbbg9w1m-DNOszvM68TD0_vFBtWyc18S06c8cULU"}}]}}]}]}',
  },
  createProvisionalIndexFile: {
    cid: 'QmNwg5MrjFhGdPftqMTBYi5raYNuh122DjvYHAQUtrKx6Q',
    content: Buffer.from(
      '1f8b0800000000000003ab564ace28cdcb2e56b28aae8630dd327352438b3295ac94027313d30c43bd9c8bddcd539d2d927d92b2838a2a9dbc92ca2c42cc8bcbaa9cdc4d8b4c1233229cc2cac20b22f2956a636b015c0b64f84e000000',
      'hex'
    ),
    jsonStr:
      '{"chunks":[{"chunkFileUri":"Qmaf1UJCsG7eC8cLbkRryBJbv8T7svzBG5r4ahXBVvWpXo"}]}',
  },
  createCoreIndexFile: {
    cid: 'QmYtZhCUqbyvuQrjNHRtYvh2NRtog1xPfxsqC3AXDK8oen',
    content: Buffer.from(
      '1f8b080000000000000325cdc16e82300080e177e979878103851ba0885388202cb065592ab4a50c282b05bb11de7d18cf7ff2fd13e8381b694f590beb435b20e9d21a259c0213844d70239acf2bb7dc17672c7efcd8cea8c661160ca5a2aadb6acc3c2b4c043f4a3d044f80758843b1503d30279073040502e6c704fa01632ab750c07b28502da007fb7279eca8a39cf6b87c59bfdb69e546e9ee2458fbbae99c2bd173c3be0a2fb588a56ae3f91293e5c151ce46c47f1dd6345434a8150f65e57fa9c5e12db1d9b0d213031f633bd0fd3f435aaa9451a490defb769ed71be37203f3fc39cfff5b850a70fa000000',
      'hex'
    ),
    jsonStr:
      '{"provisionalIndexFileUri":"QmNwg5MrjFhGdPftqMTBYi5raYNuh122DjvYHAQUtrKx6Q","operations":{"create":[{"suffixData":{"deltaHash":"EiC1LGfh47ZBXjFRXELtonJ8pCbg6c9BbtHXAgA25vPSTg","recoveryCommitment":"EiC3M_2dIVUBou36U9fKTBN6Mz9xA2xxRR1gsHkC0789Sw"}}]}}',
  },
  recoverOperation: {
    cid: 'QmWA2bmcdTLAVDMjddeFJvw4fdxoNkJSUvUhKJiipPgP7R',
    content: Buffer.from(
      '1f8b08000000000000031d52c18eaa3000fc17ce2f2f1450176fae580497b20569a12f7b289495420183ae28c67f7fbad799c94c663277ad3f96033fcbbe3b69cbbb3694457f29076df9efae9de4a12b85c3cf5c5b6ae5cdaf72b790a1f4613279003527f98dff3ee186d1ab9e25555518875f9a27112f53ff1d37c0142e03598bdc3855ac545593ebf6885211e6135b23fa6604eef5c29303c04d651225224f8eb268499d9b4c159dfa606923c3ee24b919cdbcba975112c88fb55f175df6ca9a1845635027069f362fdc7a6942874da5c3668208466b1244f0082814168536149bf3904304b801ead8119825de84201a68426a76f34e5ed7fcfa1215cd895b91b2464ed4bc19c8103ddd120fa7648e0db62654ecb84e4cdab0e1d905073a9b50e78d5ea73f3d7c9519b6c1527f860dfb9c53a5e794fc88b537f71a728c363041ee55652db06213eec314def6200a99ae42def8806f3340129fc6a032331d61ac57b2540aa560f39a7cb46ba7b7aa614faef9caec570bbc9d67a1dcc7c1ec06bee7f6c2a917ade57c1eccb8caab7a67eec6b41db69b9f993ac2b4b8aee0bbb5a8a8ee82616a179f47d4daf988b5c7d71f4d94bc38cb0b3f97cf037c3d1eff01a01333901e020000',
      'hex'
    ),
    jsonStr:
      '{"operations":{"recover":[{"signedData":"eyJhbGciOiJFUzI1NksifQ.eyJkZWx0YUhhc2giOiJFaURaeXJBQk13dGZ1YmNGSXlZelhkb09wNXdObzZCNW82MGxvaUg1Qkh3VldRIiwicmVjb3ZlcnlLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoiODZzeDZ5dVdZWjVMRFp1WFd4WF9FdEtrbFN1a21jSDdQZUIzNFNrWUVjZyIsInkiOiJzVlR6VGhVejNDRk82N2doWHVIQXV6Q2ZCVWdKa0V3WkZrbzZQM0ZzNnIwIn0sInJlY292ZXJ5Q29tbWl0bWVudCI6IkVpREFUNGxlYm14S3FTOXFyT1ROZ0lOakJ1aHY1VUJWS1h3Y0NQQ0hiellNX1EifQ.w9jDo4hrTVxbA3oA7QH6YOiTSM5y1f697Dj7m4DPg3ShbhjK3KwXmrHEu5lpFXcxAFB47hW0G1rzm7PpNm9bwQ"}],"deactivate":[]}}',
  },
  recoverChunkFile: {
    cid: 'QmSWPef9rhcZm47PWcLkfL1262GEyFiHEyazi1SrecXZD6',
    content: Buffer.from(
      '1f8b080000000000000325cabb0ec2201400d07fb9734d7cc457376d7de2e0ac61b8c2ada585422c0ca4e1dfd5743bc3194092f6d843fe1cc0a117358d46e195ed20870f398d822003694530d479c87f35bcb4128ce27ff3947806c149f4545863941f1b1c54595e27fdb6b8376dbd8a785ea2bb5dd86376daacd9d4d5a1dd2f8eb68af3d0d0ee0d89a72f8125ee1690000000',
      'hex'
    ),
    jsonStr:
      '{"deltas":[{"patches":[{"action":"replace","document":{"publicKeys":[]}}],"updateCommitment":"EiDDJ-s9CPjkh6yaH5apLIKZ1G87K0phukB3Fofy2ujeAg"}]}',
  },
  recoverProvisionalIndexFile: {
    cid: 'QmP9u7Ar8jZq2Je6FcH5k7NGNTo3h1e2waWT5qjfX7hUob',
    content: Buffer.from(
      '1f8b0800000000000003ab564ace28cdcb2e56b28aae8630dd327352438b3295ac94027383c30352d32c8b3292a3724dcc03c2937db2d37c0c8dcc8cdc5d2bdd323d5c2b13ab320d838b529323a25ccc946a636b0163e9b8c34e000000',
      'hex'
    ),
    jsonStr:
      '{"chunks":[{"chunkFileUri":"QmSWPef9rhcZm47PWcLkfL1262GEyFiHEyazi1SrecXZD6"}]}',
  },
  recoverCoreIndexFile: {
    cid: 'QmTFzVs16FuPtzXK8NWqsvyNkUxd3bvqWf73UEa2YHhRzk',
    content: Buffer.from(
      '1f8b08000000000000034dcfcb6e82401840e17799b52e041174e7a5205028c8adb6690c323f38080c8e5c468cef5e926efa00e74bce13d58c76e44e6815177a8581aba4808011b4426ee92c5b79cd94fceb2618b05093bd74956dcdf6a9789981d0c7912fddf2f453be04f48c2688d6c0e266a4ee68f5440c12da0143abef27c2047b6d9a123eb26f64739aab6279ba0d52b3c187722b3789f5e11abc33bd87be1ddc79c01b25d17c5b0ab39165d0415c8471d1c25fbe53f910953c0bb5a5b79f3ac7e9f238c8e2745156ba0259f5a87d3e4bf3c2b4cc1ebd7e5e139450060ea334fd3f17ad85739960ff7d1deeac1c63508dae9fa79853fb6a7841175c4c8390dac91cf9805ebf1778a12e29010000',
      'hex'
    ),
    jsonStr:
      '{"provisionalIndexFileUri":"QmP9u7Ar8jZq2Je6FcH5k7NGNTo3h1e2waWT5qjfX7hUob","operations":{"recover":[{"didSuffix":"EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg","revealValue":"EiBDFxzWmxgVG9SH-PY-9Yz73-6mnI8egnypTx1fjlKMKw"}]},"coreProofFileUri":"QmWA2bmcdTLAVDMjddeFJvw4fdxoNkJSUvUhKJiipPgP7R"}',
  },
  updateCoreProofFile: {
    cid: 'QmXTTBqcYyWZiTsK9GgkB2CUgSHV5prnG1FPjJyR7544Ta',
    content: Buffer.from(
      '1f8b08000000000000031590d98e9b300045ff85f7a96220a392379a60b0cb92606c96aa1ab14d31664b202121cabf37bc1e9d7baf749f523f949774e27d374abba7741d8a742aa5dd9fa734f27f5d591cd229957652f9c05566e6dce318d20501578cfcfbf4e38d416efa5561323b8904f7ba91a78abf4575cf7dea707b8febbc8bd7d89284eeecd4544e1763e5eaea3841e1b14e9f2365986d8a3d5781a20cde53c23de7070102024606b52191ef4360b84602aa1b91e167fc4023eac4daab060b3e9e9a8478e61d06a1a6ba6f275e584c4111933d78d0765b6796d866b27b0bd82fca44c592765a50b71951eb3799e557c4844bba479f48b0e12433419b240e4d3fa51be690d63fbb4b85f386cd296438168c845007346c2e24704162b01b69a19f1bc67ac9475f96b050a38bfe0d6c6d9836eccba923645cb3b36e58bf8fa60e4605779722b4addc54ae1194e784a0af7b7f7082c6bfce96c0f5f4314d1af8b92f352f9ab97a3c49afbfafd77fde433886ad010000',
      'hex'
    ),
    jsonStr:
      '{"operations":{"update":[{"signedData":"eyJhbGciOiJFUzI1NksifQ.eyJ1cGRhdGVLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoiMTdOVnAwX3pwLUJON3FkeTJhbkNqcDk1TS1sVF9pZ2xpTENEZ1hvS2F6YyIsInkiOiJ4TzJPQlZSOGxFTW94N1hvYzVYU1dYSC1yUm5jbHk5b2NvTVBUVkhVZmtzIn0sImRlbHRhSGFzaCI6IkVpQ2VkUlZYWGRaU0VMSmRqNzhJclVwaFVJYkVSWFA1UWlrSTN1ZEVvSmFRcEEifQ.-oeeFd4XrAf1L9pt0V_MjXIEubqAEHKPGA1s3JnrdWLHcG3uXF2wZSI_xoDMTlRuwHkJjt-tt918Ce9OXwi4PQ"}]}}',
  },
  updateChunkFile: {
    cid: 'QmThTeu2cFVR6YQSXHj4cLfD1K2zTqsZY9Efmn6MMCbUgA',
    content: Buffer.from(
      '1f8b08000000000000033d8cc10a82401445ff65d6061a08e54e4a420b2a302ac2c563de23271a67d09716e2bfa725eecee51c6e2b909e0c95086eadb0c032a73f8364650a1108409c5554d64af6c611130e91c23ea88ca6187bc51f4be34e079ce2a8406b54c1a39c66977599235e16816965b456ace957456a9d8087dec275f3f943d6bb7de293b9837f28e370790e9b77b9ddd4a7eb2569523a0e3f5fa56f761cc8000000',
      'hex'
    ),
    jsonStr:
      '{"deltas":[{"patches":[{"action":"add-services","services":[{"id":"someId","type":"someType","serviceEndpoint":"someEndpoint"}]}],"updateCommitment":"EiDJa1d1800h2jcvLOJ5eoga5PrIA9WAwxrKGvUYXJwTeQ"}]}',
  },
  updateProvisionalIndexFile: {
    cid: 'QmV4MBV9RXufnKdcrarA4wsNdFaoV3stGdxWT2Y5P5MmA3',
    content: Buffer.from(
      '1f8b08000000000000034d8fcb6e82400045ff65d636410b1add090846a0220c08348d19c78119449e0e4509ff5e6a37ddddcd3939b70798f2fcda80d567ff37359611af6660050e374821e133acf9ce3c3cb8c13615b119ab5363f684551385cb4d7ccbe796a59cbd640d86af09284a52a33b2bf251d8035e5ed09dbcd4177671791cb36ef46e98cc39c347bfdbe333558ec2c732749dddb7bc40bc3a3fa9458d645a050e74de85d31a4c404d5a82321f659cbc7055d0ee0127547254ffa46626def32eb573f85652a2db316d51e8b1d62cf55bf49b354c4059172d6bc62e94d97551c4ff4f0610ca150e1fc788c1c658eac9559e295ee26e7da9ac737daad9e9eee12c245184080c3f6d7ee0a831010000',
      'hex'
    ),
    jsonStr:
      '{"chunks":[{"chunkFileUri":"QmThTeu2cFVR6YQSXHj4cLfD1K2zTqsZY9Efmn6MMCbUgA"}],"operations":{"update":[{"didSuffix":"EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A","revealValue":"EiD0FtXueh5RDV_DlLcOuxjPnT-pheGPfhvaYUivLpGmZA"}]},"provisionalProofFileUri":"QmXTTBqcYyWZiTsK9GgkB2CUgSHV5prnG1FPjJyR7544Ta"}',
  },
  updateCoreIndexFile: {
    cid: 'Qma7WfcE6SZZmd3Tg9K3pmNNvdAHJ6YeGiaZz4Fs4QdED5',
    content: Buffer.from(
      '1f8b0800000000000003ab562a28ca2fcb2ccecccf4bccf1cc4b49ad70cbcc490d2dca54b2520acc0d33f1750ab30c8a284dcbf34e492e4a2c7234292ff64b714bcc0f332e2e714fa9080f318a340d30f5cd753456aa05003f1359464c000000',
      'hex'
    ),
    jsonStr:
      '{"provisionalIndexFileUri":"QmV4MBV9RXufnKdcrarA4wsNdFaoV3stGdxWT2Y5P5MmA3"}',
  },
  deactivateCoreProofFile: {
    cid: 'QmTuXXAuUe18J78ntn9raW9U6gHFyoftmAm8CdmhgTuCf2',
    content: Buffer.from(
      '1f8b08000000000000031d8d5b73a2300085ff0bcfdb8e04d8ae3eaa04a192562e89b0d36142926a0886eb78c1f1bf6fddc7f39d6fceb91b4d2b7a3aca460fc6e26ef4823567d11b8bbf5fbf0c2e281be5998ee227df8d411eb4e06b3a526361885b702c3d263f6400d3c937911ae4f7eef5072b4aa28493fc44f787ff354d039393bac2666e270049eaa27de8da0ec1288e355f21004d4682dfd4359b18b02bc3c718437f0ae17ce9cb8b64275c95565e335d6ff3bd921f7a90d48a1cbf6a64948672bb0a2aa6b3e7d794137409ab14d0c97d72fbe96cd32321308810465ea2a38640054275bd510b811cf08e2b5c53179a715d5b6582553ccbf3780a9cfce60fbe56cfdd6e8771979d1a07593ee06b9464b3f68c89b94eaae822aaa8e57bdc720ff7a13bbec735a4a1e69bd43cd8be36e7afdbf9775d789bdea906b149997267fc6acbf2255350c2e5d5c90e1c067f8a9621fa66069f49e92520b10b92bd6dd261d72d45015f6e53b3e6056ca6a1852bf0d9bd5f8cc7d7e3f10f52ec31c5c0010000',
      'hex'
    ),
    jsonStr:
      '{"operations":{"recover":[],"deactivate":[{"signedData":"eyJhbGciOiJFUzI1NksifQ.eyJkaWRTdWZmaXgiOiJFaUJ1dWljV1Z4T2NiaENXME45WVNSSndCN2F1cWJ6aE1oS2cxcVhSVFIzMF9BIiwicmVjb3ZlcnlLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoiLUhWWFJRNVNGTnRoWFk2Mkxya3N2Z2dqdkVlaEF1Sll3bTVkS0ZZSzJ5ZyIsInkiOiJqQVVqYmo5N3I2dDNTY0pvVW1DTjRwejRpdXVpdGVrMEtKSlFaMndHU1g4In19.L9fl_GHr5jseHUckE0dx4ib-YkFiFBx5YgdFJ8_pcNa71JPTbGT2T4_WY7HUsQqBe_F-yzoDd_FozspFC2PqKw"}]}}',
  },
  deactivateCoreIndexFile: {
    cid: 'QmcZqcNStfeoS3QmSUdzAoMdiVsq5dfGdGT5vothPcvWao',
    content: Buffer.from(
      '1f8b08000000000000031dcc5b4f83301880e1fff25dcf8479d8803b465c0cf3081470c69042bf429552a8edd85cf8ef2e5ebe17cf7b0635a0a646a8fe07fc3330a4b511076a10fc8f4b0a9658cec5117cb8171b6b459d67c797ba6ac3dc79f6de93389a366b6ac7eab77d6a77cd722ce234be71ca0016a0f180b4cb6867f19f87df57ac5c51f1954459e4ed1c67ecf8a01f094e654af6e3feb67299e9ca3b394c13cc9ff3026aa5f1552bc5b7a243a2c565f326535b148125b874a3b5db9bded334f7c8aa79d89e143732906ec864dba436e4d730ff01f1e03601e1000000',
      'hex'
    ),
    jsonStr:
      '{"operations":{"deactivate":[{"didSuffix":"EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A","revealValue":"EiCk-d_6aijSJVJ9K00qlfprLUew_TUZqZ4b8dtl_5mpww"}]},"coreProofFileUri":"QmTuXXAuUe18J78ntn9raW9U6gHFyoftmAm8CdmhgTuCf2"}',
  },
};

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

export const testBuffer = Buffer.from(
  '1f8b08000000000000034d91db6ee2301086dfc5d73dc5b4bb2d7729a5a1453408e8525a21e4d893c4cdc1966343bc28efbe362c6d255f8cfff9e7f3cc788f18949a34a8ffb1474632a26120aa8aeb0a6a8dfa68c8c3cdb9685e2c4e696ca2e8f760160f9377f5ccec34bca6365946b3ccacdab45d1457193a4392689ac39147a8e6a2761405b224145c9a096a8ee83d922629391d833dba3973ce866735af33273ab3b6127c0f9435640e54e29b5f45f007144f39251eed6cf82ab8f3cf9e58cfbbc2b30b6d7de5c0a5a8da7af0a9de29adbb7f62dc9b3d9a84f5a2e5e805bfc5f1b99e878b30d4e5fd2bbef91b4c8a16f7623adebcba0a0f63f3227f8b69c03f37ed232b96228f52939adbebc9f41ea623bb9a8c47692b57b1a1a8f31d29299ac32610313a7743ffefdaf148d380f2f104742e98ef924892f0926bfb546fc597f15b7e8012b2935c800d33057058e5ba5b9fb9f9d49653f8b9caa3f2c402dcfb5e66232a58f8f0ab64583329f8e1b773ad65d3bfbcdced76174695175454a85b77eeacbb7fdffa6cbc2a020000',
  'hex'
);
export const testString = 'anyCoreIndexFileBuffer';

// Base 58 (Ipfs Content Id)
export const testBufferHash58 =
  'QmRTh3XfCZKuHLG1zpHU8tkZTbyhBMGgrz1ibvAoy1UwZr';
export const testStringHash58 =
  'QmTRcidPgKTQwRehPbg5rr6unGG8mxaNZgLfsiK1HEvTH5';
export const testObjectHash58 =
  'QmRfujbtMhoTxJKSFsJn9hGdmXGiPG7iGPWzRu1MBqhrkd';
