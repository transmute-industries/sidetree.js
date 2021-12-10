### Instructions for deploying on GCP

1. `cd packages/dashboard`
2. `cp .env.example:sidetree.testnet.example .env.example:sidetree.testnet`
3. Set the variables in .env.example:sidetree.testnet according to how you want your hosted sidetree setup.
4. `npm run dev:docker`
5. At this point you should be able to test sidetree locally, to go to http://localhost:8080 in your browser.
6. gcp cloud console setup https://github.com/transmute-industries/wikis/blob/master/docs/setup-gcp-continous-deployment.md
7. Install gcp cloud sdk command line tools, configure it with the project and authenticate with the service account.
8. Build and push the docker container to gcp.

```
gcloud builds submit \
            --quiet \
            --tag "gcr.io/$PROJECT_ID/$SERVICE:$GITHUB_SHA" \
            --timeout=1200s \
            --machine-type=n1-highcpu-32
```

9. Deploy container to cloud run.

```
gcloud run deploy $SERVICE \
            --region $REGION \
            --image gcr.io/$PROJECT_ID/$SERVICE:$github.sha \
            --platform "managed" \
            --set-env-vars SIDETREE_METHOD="${{ env.SIDETREE_METHOD }}",MONGO_DB_CONNECTION_STRING="${{ env.MONGO_DB_CONNECTION_STRING }}",... \
            --service-account "$GCP_RUNNER_SA" \
            --quiet
```

10. The command should give the url to check against that cloud run is on, you will need to make the https public
