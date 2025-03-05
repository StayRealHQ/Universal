# StayReal: `notification-sender`

A standalone script that sends notifications to StayReal users
through FCM (Firebase Cloud Messaging), it doesn't support APNs (Apple Push Notification Service) yet.

## How does it work?

It simply polls the moments endpoint every 5 seconds on every region
and sends a notification whenever a new moment is found, e.g. `id` is different from the last one.

## How to run it?

```bash
pnpm install
tsx ./src/index.ts
```

## What about production?

> A Dockerfile is cooking, stay tuned!
