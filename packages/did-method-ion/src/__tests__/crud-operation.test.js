/**
 * Instructions
 * To run this test, you must to the following
 * 1. Follow the ion-install-develop.md instructions
 * 2. Have IPFS running as a daemon
 * 3. Not have bitcoin-core.daemon as a background
 * 4. Have the ion repository cloned as /home/ubuntu/ion
 * 5. Have the config files for ion configured
 * 6. Have built the ion-development files
 * 7. Not have ion-core or ion-bitcoin process running
 **/

const { execSync } = require('child_process');
const { 
	ipfsReadme,
	bitcoindError
} = require('../__fixtures__');

const opts = {
	encoding : 'utf-8'
}

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
	
	it('should return transaction fee', () => {
		for(let i = 0; i < 10; i++) {
 			execSync(`bitcoin-core.cli sendtoaddress ${ionAddress} 0.5`, opts);
			execSync(`bitcoin-core.cli -generate 1`, opts);
		}

		const feeinfo = execSync(`bitcoin-core.cli estimatesmartfee 1`, opts);
		const fee = JSON.parse(feeinfo);
		expect( fee ).toHaveProperty( 'feerate' );
		expect( fee.feerate ).toBeGreaterThan( 0 );
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
