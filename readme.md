For a detailed guide on building fullstack production-standard applications, see my guide: [fullstack-production-standard-app](https://dissanayakeg.github.io/fullstack-production-standard-app.html)

📝 **More of my work:** Check out my other technical articles and projects at [dissanayakeg.github.io](https://dissanayakeg.github.io/)

# Setup

## setup front end

```bash
cd client
pnpm install

cp .env.example .env
pnpm run dev
```

## setup back end

- Create a database and update the `.env` entries

```bash
cd server
pnpm install

cp .env.example .env
pnpm run migrate
pnpm run dev
```

- To test the email sync, you will have to create a `google cloud console project` and enable `push notifications`

# setup Google Cloud Console project and enable push notifications

## create new google cloud console project and add oAuth

- Goto https://console.cloud.google.com
- Select project
- Select new project
- Give a name and no need to change location

Save!

Go to Overview page
- Select APIs & Services from left menu
- Select OAuth consent screen
    - select Branding -> add app name -> add user support email -> add developer contact information
    - select Audience -> app should be External -> add test user
    - select Clients -> create client -> select Web application -> add name -> 
        add http://localhost:5000 (js client url) and
        add http://localhost:5000/api/v1/auth/google/callback (callback url)
    
    - Select Data access -> add or remove scope

        - Select all below options
            - auth/userinfo.email
            - auth/userinfo.profile
            - openid
            - https://mail.google.com/

    Save!

- Again select select APIs & Services from left menu
- Select Credintials -> create credentials
- Update the .env with these credentials

## Add pub/sub for push notification

- Hoto your google cloud project
- Search Pub/Sub
- Select Topics
- Create topic
    - Add topic id (ex: gmail-push)

- Select Subscription from sidebar
- Create Subscription
- Add prefered id
- Select topic that you have created
- Select PUSH radio for push notification
- Add endpoint url,
    > Here we must add a HTTPS url, we can use ngrok like service to generate https url from local computer
    > install ngrok from https://ngrok.com/download/linux?tab=install

```bash
pnpm run dev #http:localhost:5000
# open a new terminal
ngrok http 5000 --host-header="localhost:5000"
```

- Generated url will look something like this
- https://example.ngrok-free.dev
- Add `<generated url>/api/webhooks/<Environment.GMAIL_WEBHOOK_PATH>` here.

- We can verify if the ngrok url is working by calling health-check url `<generated url>/health-check` from a curl request
  or directly from browser

- After that we need to add permisions.
- Select created topic
- Select Permissions in the right side
- Sdd priciple
- Add "gmail-api-push@system.gserviceaccount.com"
- Select Pub/Sub Publisher

Save!

Done!


# Next steps

- implement csrf token machanism
- for now, this application show only inbox mails, still need to show other boxes like sent,spam...etc
- improve UI for nested emails
- support multiple gmail accounts for a single user