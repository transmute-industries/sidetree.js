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

## Create Wallet

### Fund Wallet

## Run with Docker


