## Setup

Add your Tele handle to the Users sheet in the Excel file, and your organisations you are a member of to the userOnOrg sheet in the file. Otherwise, you can manually add it yourself (steps below)

#### Set up pgadmin

1. Install pgadmin (or your own preferrend software, or the CLI if you prefer that) - https://www.pgadmin.org/download/
2. Launch it - the default password is 'admin'
3. Right-click on "Servers" and click on "Register"
4. Ensure that you have launched the docker POSTGRE DB
5. Put the "name" in the "General" tab as "nusc"
6. In the "Connection" tab, "Host name" is "localhost" and "port" is 5433. The password is "1234" (you can leave the username as "postgres")
7. Save it! Note that to save changes to pgadmin, need to use "F6" or click on the tiny save changes button after you add your new rows.
8. \[If you add not do this already to the Excel sheet\] Login to the Telegram via [this link](https://usdevs.github.io/uscwebsite-hackathon-backend/) and add yourself as a user to the "Users" table in pgadmin.
9. \[If you add not do this already to the Excel sheet\] Add yourself to an IG/organisation in the "UserOnOrg" table

#### Set up the database

```bash
$ docker compose up
$ npm install
$ npm run prisma:migrate
$ npm run prisma:seed
```

#### .env file

Add the .env file - get it from an existing person using the repo. Be sure to configure the values appropriately.

## Usage

2. `docker-compose up -d` to start development database
3. `npm run dev` to start development server
4. `docker-compose down` to stop development database
