# Testnet Docker Install

This guide will describe how to install and run Element locally using docker. 

## Table of Contents

1. Install Docker
2. MongoDB Atlas
3. Infura
4. Create Wallet
  - Fund Wallet
5. Run with Docker

## Install Docker

Docker can be installed on a variety of operating systems.
For instructions on how to install the docker engine on your device, 
please refer to: https://docs.docker.com/engine/install/. 

In the case of Linux, the `docker-compose` command needs to be
installed seprately, please refer to this documentation: https://docs.docker.com/compose/install/.

To continue with the instructions for this installation, you should be
able to run the `docker` and `docker-compose` commands. 

## MongoDB Atlas

Navigate to https://www.mongodb.com/, and click on the `Try Free` button in the top
right hand corner.

![mongodb-step01](https://user-images.githubusercontent.com/86194145/154098036-d5d41767-2f3b-417f-8f67-eb487e37157b.png)

Either fill in the form to create a new account, or use an existing Google account to signup for 
MongoDB Atlas. 

![mongodb-step02](https://user-images.githubusercontent.com/86194145/154075769-90b7b4fe-d814-4346-b862-8fd295bbb59b.png)

Accept the Privacy Policy and Terms of Service.

![mongodb-step03](https://user-images.githubusercontent.com/86194145/154075771-c392f028-b94a-4c6b-9a1e-6d6a9a5cf1ad.png)

Then fill in the questionaire after signing up, and then click on the `Submit` button.

![mongodb-step04](https://user-images.githubusercontent.com/86194145/154075777-9977e7e7-8c79-4459-ba96-1770ed358b57.png)

Click on the `Create` button on the Free shared tier.

![mongodb-step05](https://user-images.githubusercontent.com/86194145/154075783-e8789b1a-dc5b-471d-802d-aa03ee61d716.png)

From there click on your preference for provider and geographic location and then click on the `Create Cluster` button.

![mongodb-step06](https://user-images.githubusercontent.com/86194145/154075786-ee7549e5-1d98-4059-9f5d-a96288f8ad40.png)

When ask to invite other users, you can click on the `Skip` link under the form.

![mongodb-step07](https://user-images.githubusercontent.com/86194145/154075792-60dc13aa-60dc-41b1-9d44-d0a11143a674.png)

From there, you will be taken to the Quick Start page.

![mongodb-step08](https://user-images.githubusercontent.com/86194145/154098847-da4ee1f2-1f15-4750-99b3-4990cccd763f.png)

First we will create a user to connect to our cluster. Enter a username, we will use `element`, and then
click on the `Autogenerate Secure Password` and save the password in a place where you can reference it.
Once you've done that, click on `Create User`.

![mongodb-step09](https://user-images.githubusercontent.com/86194145/154098854-80ecaeee-c0f6-4141-ad1f-2c97ca22ed72.png)

After clicking on `Create User`, your username and Authentication type will be listed below the form.
If you need to, you can click on `Edit` to create a new password.

![mongodb-step10](https://user-images.githubusercontent.com/86194145/154098857-e679a63f-9131-4708-bb1a-fd4b298af459.png)

From there, scroll down to the next form which defines where you will be connecting from. Click on on the 
`Add My Current IP Address` button. 

![mongodb-step11](https://user-images.githubusercontent.com/86194145/154098861-1b0dfbaa-82b0-46d5-aa64-0a550aab609f.png)

After clicking the button, you should see your global IP listed below the form. Once confirming this, click on the
`Finish and Close` button. 

![mongodb-step12](https://user-images.githubusercontent.com/86194145/154101720-1e4f3dc4-8f0e-42c6-982e-1ab2a6170e11.png)

You will then be directed to the `Databases` tab. Click on the button that says `Connect` next to `Cluster 0`. 

![mongodb-step13](https://user-images.githubusercontent.com/86194145/154098867-9c52af2e-0f80-4741-bd85-d387e2b1b699.png)

Click on the second list item labeled `Connect your Application`. 

![mongodb-step14](https://user-images.githubusercontent.com/86194145/154098869-242e43dd-f000-43c8-8ef0-988b97efd027.png)

You will then be provided with you **MongoDB Connection String**. Replace the `<Password>` text will the password
you generated in a previous step. 

![mongodb-step15](https://user-images.githubusercontent.com/86194145/154098871-5329df5f-3ec8-4bf9-bb49-27eee6542521.png)

## Infura 

In your browser navigate to https://infura.io. Then click on `Sign Up` in the navigation bar.

![infura-step01](https://user-images.githubusercontent.com/86194145/154111108-008edf44-b7a1-498b-a0fd-a7c365802425.png)

Enter your email address, provide a secure password and click on the `SIGN UP` button to submit the form.

![infura-step02](https://user-images.githubusercontent.com/86194145/154111116-cb35d18c-fd98-4c8c-be22-de7d6c0af9a9.png)

A confirmation screen will appear indicating that a confirmation link was sent to your email.

![infura-step03](https://user-images.githubusercontent.com/86194145/154111119-838de71e-5786-4319-9ae4-d8f88d4a07fc.png)

Locate the confirmation email in your inbox. Click on the `CONFIRM EMAIL ADDRESS` button in the mail body.

![infura-step04](https://user-images.githubusercontent.com/86194145/154111121-3124d0a2-1238-4e94-a359-af8440cc9671.png)

You will be redirected to the Infura dashboard. Click on the `CREATE NEW PROJECT` button in the top right.

![infura-step05](https://user-images.githubusercontent.com/86194145/154111123-dee5a658-0029-4bed-866b-393a7ffda27b.png)

Select `Ethereum` from the dropdown for the product, and provide `element` for the name. 

![infura-step06](https://user-images.githubusercontent.com/86194145/154111127-6fea312e-7188-4407-88e1-881ba8a49213.png)

Under the `KEYS` section, select `ROPSTEN` from the endpoint dropdown. Our **Ehtereum Provider** will be the https link.

![infura-step07](https://user-images.githubusercontent.com/86194145/154111133-21485b87-6c12-41b2-8403-4c80d1a530e7.png)

## Create Wallet

In your browser navigate to https://metamask.io. Click on the `Download` button.

![metamask-step01](https://user-images.githubusercontent.com/86194145/154122077-b1de6078-e38d-4d24-a39e-2aaa28f08500.png)

You will br provided with a link to download the plugin for your browser.

![metamask-step02](https://user-images.githubusercontent.com/86194145/154122086-ebeea8a8-c770-4ff4-b2a0-8c9d3bcd5f9b.png)

Click on the link to add to Firefox (or Chrome), depending on which browser you are using.

![metamask-step03](https://user-images.githubusercontent.com/86194145/154122089-1d35b9a5-27d9-4ac2-94bc-d6bbfc827a3d.png)

Once the plugin has been installed, a new tab will open to initialize metamask.

![metamask-step04](https://user-images.githubusercontent.com/86194145/154122094-2a3918e2-985b-4364-9a01-aefa5ad61702.png)

Click on the right option to `Create a Wallet`.

![metamask-step05](https://user-images.githubusercontent.com/86194145/154122097-dea050c8-1ee4-4cb3-bafc-95c96c27089f.png)

Provide an answer to the option to provide anonymous statistics.

![metamask-step06](https://user-images.githubusercontent.com/86194145/154122101-48367403-9e76-4d98-9e97-27331b9dfe35.png)

Create a password. This should be secure but memorable, as you will need to enter this password if you plan to use Metamask from your browser.

![metamask-step07](https://user-images.githubusercontent.com/86194145/154122105-32ad59a6-bee8-4352-9682-fd95fe0a8f4c.png)

You will then be taken to a video which provides guidance for securing your wallet. Click on the `Next` button when you're ready.

![metamask-step08](https://user-images.githubusercontent.com/86194145/154122108-494d3afb-e0c3-4daa-965f-504faf4ca8db.png)

From there click on the blurred box to reveal your **Recovery Phrase**.

![metamask-step09](https://user-images.githubusercontent.com/86194145/154122114-1a7f8f7d-e04b-430c-9d05-38926824e96a.png)

Copy the contents of your **Recovery Phrase** and paste it somewhere, or physically write it down. Click on 
`Next` when you're ready.

![metamask-step10](https://user-images.githubusercontent.com/86194145/154122116-c9aacc99-b796-4123-9dea-002d0ce140b1.png)

To make sure you have your pass phrase recorded, you will be prompted to select each word in order. Do so and click `Confirm`.

![metamask-step11](https://user-images.githubusercontent.com/86194145/154122118-52ef56fe-3759-4738-861b-6a4a807561b5.png)

You will be given a short screen congratulating you for setting up your wallet. Click on `All Done`.

![metamask-step12](https://user-images.githubusercontent.com/86194145/154122121-ff472770-698f-4238-bc2a-413f7cec64e7.png)

You will be taken to your wallet, which will have no funds in it.

![metamask-step13](https://user-images.githubusercontent.com/86194145/154122126-cfb72284-1673-4d8a-a3c7-1ec945325235.png)

Click on the circular identicon in the top right corner, and select `Settings` from the bottom of the menu.

![metamask-step14](https://user-images.githubusercontent.com/86194145/154122129-81dfcbe3-b5d9-4531-b3f8-0239027c7fe8.png)

From there, click on the `Advantaced` tab, and then locate the option for the option to `Show Test Networks`, and turn
it on.

![metamask-step15](https://user-images.githubusercontent.com/86194145/154122133-fdfe6263-18d9-4ce2-bb13-dd97680a61bb.png)

After that you can click on the select menu that says `Mainnet` and select the option that says `Ropsten`.

![metamask-step16](https://user-images.githubusercontent.com/86194145/154122139-9e09528f-54bb-41bb-8a34-f2e1a313aa73.png)

From the settings menu, you can click on the close button to display your wallet. We are now ready to add test funds.

![metamask-step17](https://user-images.githubusercontent.com/86194145/154122142-8dd85ae9-cedc-4d69-8a12-42488f27b3b6.png)

### Fund Wallet

In Metamask, click on `Account 1` at the top of your wallet to copy your address.

![add-funds-step01](https://user-images.githubusercontent.com/86194145/154128224-9314a93b-52b8-460d-a8e2-89ddcdce806c.png)

Open a new tab, and search `ropsten faucet`.

![add-funds-step02](https://user-images.githubusercontent.com/86194145/154128225-41d1b83f-91ff-41f2-894b-d1c9c89930b5.png)

Each site should function the same effectively. Put your address in the text field and click `Send me rETH`. 

![add-funds-step03](https://user-images.githubusercontent.com/86194145/154128229-d422ea35-3160-4c0f-8fee-e9bc003babf7.png)

Alot of sites will be empty, or require a queue that takes several minutes. You only need a small amount.

![add-funds-step04](https://user-images.githubusercontent.com/86194145/154128231-94652476-59e6-450b-86be-1e905b453b40.png)

Once you have a small amount of funds in your wallet, you're ready to go.

![add-funds-stop05](https://user-images.githubusercontent.com/86194145/154128234-693931c3-a783-4595-ba45-3c9110983a6e.png)

## Run with Docker


