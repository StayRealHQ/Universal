# StayReal: `notification-sender`

A service that sends notifications to StayReal users through FCM (Firebase Cloud Messaging) and APNS (Apple Push Notification Service).

## How does it work ?

It polls the last moment endpoint every 5 seconds on every region known and sends a notification whenever a change is detected.

## How to run it for development ?

You must have the following environment variables set:
- `KEY_ID`: The key ID of the APNs key.
- `TEAM_ID`: The team ID of the APNs key.

```bash
pnpm install
tsx ./src/index.ts
```

## What about production ?

We provide a `Dockerfile` and a `docker-compose.yml` file to run the script in a container.

```bash
# Start !
docker compose up --build -d

# Stop !
docker compose down
```

## Where is it deployed ?

<https://api.stayreal.vexcited.com> for the official deployment.
