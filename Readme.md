curl --location --request POST 'https://api.notion.com/v1/oauth/token' \
--header 'Authorization: Basic '"$BASE64_ENCODED_ID_AND_SECRET"'' \
--header 'Content-Type: application/json' \
--header 'Notion-Version: 2022-06-28' \
--data '{
  "grant_type": "authorization_code",
  "code": "e202e8c9-0990-40af-855f-ff8f872b1ec6",
  "redirect_uri": "https://wwww.my-integration-endpoint.dev/callback",
   "external_account": {
        "key": "A83823453409384",
        "name": "Notion - team@makenotion.com"
    }
}'