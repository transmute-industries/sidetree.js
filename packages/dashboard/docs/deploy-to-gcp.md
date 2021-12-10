### Instructions for deploying on GCP

1. `cd packages/dashboard`
2. `cp .env.example .env`
3. Set the variables in .env according to how you want your hosted sidetree setup.
4. `docker-compose build`
5. `docker-compose up`
6. At this point you should be able to test sidetree locally, to go to http://localhost:8080 in your browser.
7. gcp cloud console setup https://github.com/transmute-industries/wikis/blob/master/docs/setup-gcp-continous-deployment.md
8. Install gcp cloud sdk command line tools, configure it with the project and authenticate with the service account.
9. Build and push the docker container to gcp.

```
gcloud builds submit \
            --quiet \
            --tag "gcr.io/$PROJECT_ID/$SERVICE:$GITHUB_SHA" \
            --timeout=1200s \
            --machine-type=n1-highcpu-32
```

10. Deploy container to cloud run.

```
gcloud run deploy $SERVICE \
            --region $REGION \
            --image gcr.io/$PROJECT_ID/$SERVICE:$github.sha \
            --platform "managed" \
            --set-env-vars NEXT_PUBLIC_TITLE="$NEXT_PUBLIC_TITLE",NEXT_PUBLIC_METHOD="$NEXT_PUBLIC_METHOD }}",... \
            --service-account "$GCP_RUNNER_SA" \
            --quiet
```

11. The command should give the url to check against that cloud run is on, you will need to make the https public
