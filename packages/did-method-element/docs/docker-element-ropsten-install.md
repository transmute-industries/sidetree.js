# Testnet Docker Install

This guide will describe how to install and run Element locally using docker. 
The purpose of this guide is to provide a simple-as-possible method for 
testing did element using a Mac, Windows or Linux desktop envrionment.

## Table of Contents

1. Install Nodejs
2. Install Docker
3. Infura
4. Create Wallet
5. Fund Wallet
6. Run Element Dashboard
7. Create / Resolve Operation
8. Clean Up

## 1. Install Nodejs

Nodejs can be run on a variety of operating systems.
For instructions on how to install nodejs on your device
plase refer to: https://nodejs.org

## 2. Install Docker

Docker can be installed on a variety of operating systems.
For instructions on how to install the docker engine on your device, 
please refer to: https://docs.docker.com/engine/install/. 

In the case of Linux, the `docker-compose` command needs to be
installed seprately, please refer to this documentation: https://docs.docker.com/compose/install/.

To continue with the instructions for this installation, you should be
able to run the `docker` and `docker-compose` commands. 

## 3. Infura 

3.1 In your browser navigate to https://infura.io. Then click on `Sign Up` in the navigation bar.

![infura-step01](https://user-images.githubusercontent.com/86194145/154111108-008edf44-b7a1-498b-a0fd-a7c365802425.png)

3.2 Enter your email address, provide a secure password and click on the `SIGN UP` button to submit the form.

![infura-step02](https://user-images.githubusercontent.com/86194145/154111116-cb35d18c-fd98-4c8c-be22-de7d6c0af9a9.png)

3.3 A confirmation screen will appear indicating that a confirmation link was sent to your email.

![infura-step03](https://user-images.githubusercontent.com/86194145/154111119-838de71e-5786-4319-9ae4-d8f88d4a07fc.png)

3.4 Locate the confirmation email in your inbox. Click on the `CONFIRM EMAIL ADDRESS` button in the mail body.

![infura-step04](https://user-images.githubusercontent.com/86194145/154111121-3124d0a2-1238-4e94-a359-af8440cc9671.png)

3.5 You will be redirected to the Infura dashboard. Click on the `CREATE NEW PROJECT` button in the top right.

![infura-step05](https://user-images.githubusercontent.com/86194145/154111123-dee5a658-0029-4bed-866b-393a7ffda27b.png)

3.6 Select `Ethereum` from the dropdown for the product, and provide `element` for the name. 

![infura-step06](https://user-images.githubusercontent.com/86194145/154111127-6fea312e-7188-4407-88e1-881ba8a49213.png)

3.7 Under the `KEYS` section, select `ROPSTEN` from the endpoint dropdown. Our **Ehtereum Provider** will be the https link.

![infura-step07](https://user-images.githubusercontent.com/86194145/154291156-7034ce15-5003-4559-ad61-7f3c747a9377.png)

## 4. Create Wallet

4.1 In your browser navigate to https://metamask.io. Click on the `Download` button.

![metamask-step01](https://user-images.githubusercontent.com/86194145/154122077-b1de6078-e38d-4d24-a39e-2aaa28f08500.png)

4.2 You will br provided with a link to download the plugin for your browser.

![metamask-step02](https://user-images.githubusercontent.com/86194145/154122086-ebeea8a8-c770-4ff4-b2a0-8c9d3bcd5f9b.png)

4.3 Click on the link to add to Firefox (or Chrome), depending on which browser you are using.

![metamask-step03](https://user-images.githubusercontent.com/86194145/154122089-1d35b9a5-27d9-4ac2-94bc-d6bbfc827a3d.png)

4.4 Once the plugin has been installed, a new tab will open to initialize metamask.

![metamask-step04](https://user-images.githubusercontent.com/86194145/154122094-2a3918e2-985b-4364-9a01-aefa5ad61702.png)

4.5 Click on the right option to `Create a Wallet`.

![metamask-step05](https://user-images.githubusercontent.com/86194145/154122097-dea050c8-1ee4-4cb3-bafc-95c96c27089f.png)

4.6 Provide an answer to the option to provide anonymous statistics.

![metamask-step06](https://user-images.githubusercontent.com/86194145/154122101-48367403-9e76-4d98-9e97-27331b9dfe35.png)

4.7 Create a password. This should be secure but memorable, as you will need to enter this password if you plan to use Metamask from your browser.

![metamask-step07](https://user-images.githubusercontent.com/86194145/154122105-32ad59a6-bee8-4352-9682-fd95fe0a8f4c.png)

4.8 You will then be taken to a video which provides guidance for securing your wallet. Click on the `Next` button when you're ready.

![metamask-step08](https://user-images.githubusercontent.com/86194145/154122108-494d3afb-e0c3-4daa-965f-504faf4ca8db.png)

4.9 From there click on the blurred box to reveal your **Recovery Phrase**.

![metamask-step09](https://user-images.githubusercontent.com/86194145/154122114-1a7f8f7d-e04b-430c-9d05-38926824e96a.png)

4.10 Copy the contents of your **Recovery Phrase** and paste it somewhere, or physically write it down. Click on 
`Next` when you're ready.

![metamask-step10](https://user-images.githubusercontent.com/86194145/154122116-c9aacc99-b796-4123-9dea-002d0ce140b1.png)

4.11 To make sure you have your pass phrase recorded, you will be prompted to select each word in order. Do so and click `Confirm`.

![metamask-step11](https://user-images.githubusercontent.com/86194145/154122118-52ef56fe-3759-4738-861b-6a4a807561b5.png)

4.12 You will be given a short screen congratulating you for setting up your wallet. Click on `All Done`.

![metamask-step12](https://user-images.githubusercontent.com/86194145/154122121-ff472770-698f-4238-bc2a-413f7cec64e7.png)

4.13 You will be taken to your wallet, which will have no funds in it.

![metamask-step13](https://user-images.githubusercontent.com/86194145/154122126-cfb72284-1673-4d8a-a3c7-1ec945325235.png)

4.14 Click on the circular identicon in the top right corner, and select `Settings` from the bottom of the menu.

![metamask-step14](https://user-images.githubusercontent.com/86194145/154122129-81dfcbe3-b5d9-4531-b3f8-0239027c7fe8.png)

4.15 From there, click on the `Advantaced` tab, and then locate the option for the option to `Show Test Networks`, and turn
it on.

![metamask-step15](https://user-images.githubusercontent.com/86194145/154122133-fdfe6263-18d9-4ce2-bb13-dd97680a61bb.png)

4.16 After that you can click on the select menu that says `Mainnet` and select the option that says `Ropsten`.

![metamask-step16](https://user-images.githubusercontent.com/86194145/154122139-9e09528f-54bb-41bb-8a34-f2e1a313aa73.png)

4.17 From the settings menu, you can click on the close button to display your wallet. We are now ready to add test funds.

![metamask-step17](https://user-images.githubusercontent.com/86194145/154122142-8dd85ae9-cedc-4d69-8a12-42488f27b3b6.png)

### 5. Fund Wallet

5.1 In Metamask, click on `Account 1` at the top of your wallet to copy your address.

![add-funds-step01](https://user-images.githubusercontent.com/86194145/154128224-9314a93b-52b8-460d-a8e2-89ddcdce806c.png)

5.2 Open a new tab, and search `ropsten faucet`.

![add-funds-step02](https://user-images.githubusercontent.com/86194145/154128225-41d1b83f-91ff-41f2-894b-d1c9c89930b5.png)

5.3 Each site should function the same effectively. Put your address in the text field and click `Send me rETH`. 

![add-funds-step03](https://user-images.githubusercontent.com/86194145/154128229-d422ea35-3160-4c0f-8fee-e9bc003babf7.png)

5.4 Alot of sites will be empty, or require a queue that takes several minutes. You only need a small amount.

![add-funds-step04](https://user-images.githubusercontent.com/86194145/154128231-94652476-59e6-450b-86be-1e905b453b40.png)

5.5 Once you have a small amount of funds in your wallet, you're ready to go.

![add-funds-stop05](https://user-images.githubusercontent.com/86194145/154128234-693931c3-a783-4595-ba45-3c9110983a6e.png)

## Run with Docker

Clone the Sidetree.js repository, install and run background processes.

```
git clone git@github.com:transmute-industries/sidetree.js.git
cd sidetree.js
npm i
docker-compose -f ./docker-compose.yml up --detach --remove-orphans
```

This will run ganache, mongo and ipfs.
Specifically we will use ipfs and mongo, ganache is used for development.
We will be using ropsten via the Infura url that we provide.

```
cd packages/dashboard
cp .env.ropsten.example .env.ropsten
```

From there you will need to populate the `.env.ropsten` file with the values you created from this readme.
Open the `.env.ropsten` and enter the following values.

1. MONGO_DB_CONNECTION_STRING = mongodb://localhost:27017/
2. ELEMENT_CONTENT_ADDRESSABLE_STORE_SERVICE_URI = /ip4/127.0.0.1/tcp/5001
3. ETHEREUM_RPC_URL = **Ehtereum Provider** from 3.7
4. ETHEREUM_MNEMONIC = **Recovery Phrase** from 4.10

Edit `.env.ropsten` with your preferred text editor (vim, emacs, notepad++, textedit)

```
SIDETREE_METHOD='elem:ropsten'
DESCRIPTION="Sidetree on Ethereum Ledger and IPFS Cas"

# Sidetree Variables
MONGO_DB_CONNECTION_STRING=mongodb://localhost:27017/
DATABASE_NAME="element-ropsten"
MAX_CONCURRENT_DOWNLOADS=20
BATCH_INTERVAL_IN_SECONDS=5
OBSERVING_INTERVAL_IN_SECONDS=5

# Element Node Variables
ELEMENT_CONTENT_ADDRESSABLE_STORE_SERVICE_URI=/ip4/127.0.0.1/tcp/5001
ELEMENT_ANCHOR_CONTRACT="0x920b7DEeD5CdE055260cdDBD70C000Bbd5b30997"
ETHEREUM_RPC_URL='https://ropsten.infura.io/v3/<project-id>'
ETHEREUM_PROVIDER=$ETHEREUM_RPC_URL
ETHEREUM_MNEMONIC="metamask recovery phrase here"
```

Once you have populated the `.env.ropsten` file, you can run the dashboard with the following command.

```
npm run dev:ropsten
```

You will then be able to access the dashboard on http://localhost:3000

## 7. Create / Resolve Operation

Once we have Element running on our local machine, we can then run a test
operation to see if we are able to create and then resolve a did.

![Element Node Welcome Splash](https://user-images.githubusercontent.com/86194145/146037402-ae75eb83-0394-40f2-bd0e-ecfc090aed29.png)

We can start by opening up `localhost:3000` in our browser and then clicking on the `Wallet` link on the "Manage" card.

![Element Node Create Wallet](https://user-images.githubusercontent.com/86194145/146037619-c62917e7-a387-40c5-8207-2e8123302627.png)

From there we can click on the `Create Wallet` button, this will create a private/public key pair to allow us to sign did's. **Note**: The wallet [will throw an error when not used on localhost or https](https://github.com/transmute-industries/sidetree.js/issues/318).

![Element Node Create Did](https://user-images.githubusercontent.com/86194145/146037904-2fc597a9-7fd2-4ae4-acd9-5f191da04ea6.png)

Once the wallet is created, you will be automatically redirected to the `create` route. Can can then click on the `CREATE DID` button to generate a did.

![Element Node Show Created Did](https://user-images.githubusercontent.com/86194145/146040055-d60694a0-88f4-4f55-b445-748a4a806aa0.png)

Once the operation is complete, you should see the confirmation above. To see if we can resolve the did, we can click on the underlined did to be redirected to the resolve page.

![Element Node Resolve Created Did](https://user-images.githubusercontent.com/86194145/146040320-df5639fc-3761-464f-b9bf-ea98d49133e2.png)

You should see a card that looks like the above image. You can then click on the arrows to show more information about the did.

![Element Node Created Did Details](https://user-images.githubusercontent.com/86194145/146040842-393656b6-177a-4871-b96b-72dadca92265.png)

If you want more information on how to use the API interact with dids, you can read the documentation at `localhost:3000/docs`.

## 8. Clean up

Top stop running the dashboard process hi **Ctrl + c** on the keyboard. 

To turn off docker and remove the processes run

```
docker ps
CONTAINER ID   IMAGE                             COMMAND 
555af580276e   trufflesuite/ganache-cli:latest   ...
19f210df6d08   ipfs/go-ipfs:v0.7.0               ...
1b4d11e7615c   mongo                   

docker kill 555af580276e
docker kill 19f210df6d08
docker kill 1b4d11e7615c
```
