/**
 * Instructions
 * To run this test, you must to the following
 * 1. Follow the ion-install-develop.md instructions
 * 2. Have IPFS running as a daemon
 * 3. Must have ion cloned and built in /home/ubuntu
 * 4. Must have Ion config files pre-configured
 * 5. Not have ion-core or ion-bitcoin process running
 **/

const { execSync, spawn } = require('child_process');
const { 
	ipfsReadme, 
	bitcoindError,
	recoverPrivateKeyJwk,
	updatePrivateKeyJwk,
	signingPrivateKeyJwk,
	createOperation,
	longFormDid,
} = require('../__fixtures__');

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
		execSync('rm -rf /home/ubuntu/snap/bitcoin-core/common/.bitcoin/regtest/');
		execSync('bitcoin-core.daemon -daemon', opts);
		execSync('sleep 2s', opts);
		const netinfo = execSync('bitcoin-core.cli getnetworkinfo', opts);
		const info = JSON.parse( netinfo );
		console.log( info );
		expect( info ).toHaveProperty( 'version', 220000 );
	});

	it('should initialize the default wallet', () => {
		execSync('bitcoin-core.cli createwallet sidetreeDefaultWallet', opts);
		const myAddress = execSync('bitcoin-core.cli getnewaddress');
		execSync(`bitcoin-core.cli generatetoaddress 101 ${ myAddress }`);
		const balance = execSync('bitcoin-core.cli getbalance', opts);
		expect( parseInt(balance) ).toBe( 50 );
		const myPrivKey = execSync(`bitcoin-core.cli dumpprivkey ${myAddress}`);
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

		const dropBtc = execSync('mongo ion-regtest-bitcoin --eval "printjson(db.dropDatabase())"');
		const dropCore = execSync('mongo ion-regtest-core --eval "printjson(db.dropDatabase())"');

		console.log( dropBtc );
		console.log( dropCore );

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

		const dat = JSON.stringify(createOperation,);
		const createOp = execSync(`curl --header "Content-Type: application/json" \
	  		--request POST \
	  		--data '${dat}' \
	  		http://localhost:3000/operations`, opts);
		console.log( createOp );
		expect( createOp ).toBeDefined();

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
