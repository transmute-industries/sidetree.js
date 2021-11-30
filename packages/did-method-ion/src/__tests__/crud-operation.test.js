/**
 * Instructions
 * To run this test, you must to the following
 * 1. Follow the ion-install-develop.md instructions
 * 2. Have IPFS running as a daemon
 * 3. Must have bitcoin-core.daemon running in background
 * 6. Must have ion-bitcoin process running
 * 7. Not have ion-core or ion-bitcoin process running
 **/

const { execSync, spawn } = require('child_process');
const { ipfsReadme, bitcoindError } = require('../__fixtures__');
const { IonDid, IonDocumentModel, IonKey, IonRequest } = require('@decentralized-identity/ion-sdk');
const { ECPair } = require('ecpair');

const opts = { encoding : 'utf-8' }
const config = { detached : true, cwd : '/home/ubuntu/ion/dist/src' }

let btcProc, coreProc;
const ionAddress = 'mzQCLt9Eafas64E718myJ88KA1K8oRM6u2';

describe('performing crud operations with regtest', () => {

	it('should return the ipds readme', ()=> {
		const readme = execSync('ipfs cat /ipfs/QmQPeNsJPyVWPFDVHb77w8G42Fvo15z4bG2X8D2GhfbSXc/readme', opts);
		expect(readme).toBe( ipfsReadme );
	});

	it('should start the bitcoin daemon', () => {
		execSync('bitcoin-core.daemon -daemon', opts);
		execSync('sleep 2s', opts);
		const netinfo = execSync('bitcoin-core.cli getnetworkinfo', opts);
		const info = JSON.parse( netinfo );
		expect( info ).toHaveProperty( 'version', 220000 );
	});

	it('should initialize the default wallet', () => {
		execSync('bitcoin-core.cli loadwallet sidetreeDefaultWallet', opts);
		const balance = execSync('bitcoin-core.cli getbalance', opts);
		expect(parseInt(balance)).toBeGreaterThan( 0 );
	});
	

	it.skip('should return transaction fee', () => {
		for(let i = 0; i < 10; i++) {
 			execSync(`bitcoin-core.cli sendtoaddress ${ionAddress} 0.5`, opts);
			execSync(`bitcoin-core.cli -generate 1`, opts);
		}

		const feeinfo = execSync(`bitcoin-core.cli estimatesmartfee 1`, opts);
		const fee = JSON.parse(feeinfo);
		expect( fee ).toHaveProperty( 'feerate' );
		expect( fee.feerate ).toBeGreaterThan( 0 );
	});

	it('should start ion bitcoin and core process', () => {
		btcProc = spawn( 'node', ['bitcoin.js'], config )
		coreProc = spawn( 'node', ['core.js'], config )
		execSync('sleep 30s', opts);
		
		const versioninfo = execSync('curl http://localhost:3000/version', opts);
		const version = JSON.parse( versioninfo );
		expect(version).toHaveLength(2);
		const [ core, bitcoin ] = version; 
		expect( core ).toHaveProperty( 'name', 'core' );
		expect( bitcoin ).toHaveProperty( 'name', 'bitcoin' );
	});

	it('should send a create operation to ion core', () => {

		const [recoveryKey, recoveryPrivateKey] = await IonKey.generateEs256kOperationKeyPair();
		const [updateKey, updatePrivateKey] = await IonKey.generateEs256kOperationKeyPair();
		const [signingKey, signingPrivateKey] = await IonKey.generateEs256kDidDocumentKeyPair({id: 'signing-key'});
		const publicKeys = [signingKey];

		const document = { publicKeys };
	
	console.log('document model');
	console.log( IonDocumentModel );

		const input = { recoveryKey, updateKey, document };
		const createRequest = IonRequest.createCreateRequest(input);
		const longFormDid = IonDid.createLongFormDid(input);
		const shortFormDid = longFormDid.substring(0, longFormDid.lastIndexOf(':'));
		const didSuffix = shortFormDid.substring(shortFormDid.lastIndexOf(':') + 1);

		const dat = JSON.stringify(createRequest);
		console.log(`curl --header "Content-Type: application/json" \
	  --request POST \
	  --data '${dat}' \
	  http://localhost:3000/operations`);


	});

	it.todo('write the anchor string to the blockchain');

	it.todo('should resolve the did from ion core');

	it('should stop ion bitcoin and core process', () => {
		btcProc.kill();
		coreProc.kill();

		execSync('sleep 2s', opts);
		expect(1).toBe(1);
		
		try {
			execSync('curl http://localhost:3000/version', opts);
		} catch(err) {
			console.log(err.toString());
			expect( err ).toBeDefined();
		}

	});

	it('should stop the bitcoin daemon', () => {
		execSync('bitcoin-core.cli stop', opts);
		execSync('sleep 2s', opts);
		try {
			execSync('bitcoin-core.cli getnetworkinfo', opts);
		} catch(err) {
			expect( err.toString() ).toBe( bitcoindError );
		}
	});

});
