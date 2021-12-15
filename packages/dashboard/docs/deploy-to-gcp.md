## Instructions for deploying on GCP

### Local Docker testing

1. `cd packages/dashboard`
2. `cp .env.example:sidetree.testnet.example .env.example:sidetree.testnet`
3. Set the variables in .env.example:sidetree.testnet according to how you want your hosted sidetree setup.
4. `npm run dev:docker`
5. At this point you should be able to test sidetree locally, to go to http://localhost:8080 in your browser.

### Google Cloud setup

#### Step 1: Create a GCP project and setup the permissions

- Create a new Google Cloud Project (or select an existing project): https://console.cloud.google.com/home/dashboard
- [Enable the Cloud Run API](https://console.cloud.google.com/flows/enableapi?apiid=run.googleapis.com).
- [Enable the Cloud Build API](https://console.cloud.google.com/flows/enableapi?apiid=cloudbuild.googleapis.com)
- [Create a Google Cloud service account](https://console.cloud.google.com/projectselector2/identity/serviceaccounts?supportedpurview=project) or select an existing one.
- Add the the following Cloud IAM roles to your service account:

    - `Cloud Run Admin` - allows for the creation of new Cloud Run services
    - `Service Account User` -  required to deploy to Cloud Run as service account
    - `Storage Admin` - allow push to Google Container Registry
    - `Viewer`
    - `Editor`

- Download a JSON service account key for the service account.

- Associate the service account with the CLI `gcloud auth activate-service-account --project=someproject --key-file=gcpcmdlineuser.json` and `gcloud auth activate-service-account --key-file=gcpcmdlineuser.json`

#### Step 2: Building and deploying to Google Cloud Run

Use https://github.com/google-github-actions/setup-gcloud/tree/master/setup-gcloud to setup GCP CLI in order to build the image and deploy it on Google Cloud Run

See our CD pipeline to get an idea of how you could set this up using a pipeline that you could create later on: https://github.com/transmute-industries/sidetree.js/blob/main/.github/workflows/cd-dashboard-element-ropsten.yml

The following environment variables are needed to run the node, we set them for the github action as github secrets:

- SERVICE: the naming of the GCP cloud run service to be identified with
- REGION: the region name in GCP to use
- PROJECT_ID: GCP project id
- GCP_SA_KEY: the json of the downloaded service account key
- GCP_RUNNER_SA: service account email
- SIDETREE_METHOD: The did method name e.g. 'elem:ropsten'
- MONGO_DB_CONNECTION_STRING: The mongo db connection string e.g. 'mongodb://...'
- DATABASE_NAME: The mongo db database name to use
- MAX_CONCURRENT_DOWNLOADS: https://identity.foundation/sidetree/spec/
- BATCH_INTERVAL_IN_SECONDS: https://identity.foundation/sidetree/spec/
- OBSERVING_INTERVAL_IN_SECONDS: https://identity.foundation/sidetree/spec/
- ELEMENT_CONTENT_ADDRESSABLE_STORE_SERVICE_URI: The endpoint for storage
- ELEMENT_ANCHOR_CONTRACT: The ethereum public address to use of an already deployed smart contract
- ETHEREUM_RPC_URL: URL to use to connect to ethereum network
- ETHEREUM_PROVIDER: Same as RPC URL
- ETHEREUM_MNEMONIC: The mnemonic to use to associate an ethereum account with for the transactions

Other useful GCP CLI commands:

```bash
gcloud projects list
gcloud config set project <project-id>
```

Build and push the Docker container to GCP:

```
gcloud builds submit \
            --quiet \
            --tag "gcr.io/$PROJECT_ID/$SERVICE:$GITHUB_SHA" \
            --timeout=1200s \
            --machine-type=n1-highcpu-32
```

Deploy container to GCP Cloud Run:

```
gcloud run deploy $SERVICE \
            --region $REGION \
            --image gcr.io/$PROJECT_ID/$SERVICE:$github.sha \
            --platform "managed" \
            --set-env-vars SIDETREE_METHOD="${{ env.SIDETREE_METHOD }}",MONGO_DB_CONNECTION_STRING="${{ env.MONGO_DB_CONNECTION_STRING }}",... \
            --service-account "$GCP_RUNNER_SA" \
            --quiet
```

The command response gives the url to check against that cloud run is on, you will need to make the https public https://cloud.google.com/run/docs/authenticating/public

#### Step 3: Setup a custom domain

https://cloud.google.com/run/docs/mapping-custom-domains

```bash
# Help to identify the service name to use
gcloud beta run services list
# To see if domain is already verified
gcloud domains list-user-verified
# To verify the domain if it is not verified yet
gcloud domains verify <custom-domain>
# To create the DNS mapping to the service
gcloud beta run domain-mappings create --service <service-name> --domain <custom-domain>
# Domain creation and mapping takes a while, this command can be used to check the status of the domain
gcloud beta run domain-mappings describe --domain <custom-domain>
```
Once the changes propagate you will be able to go to the custom domain.