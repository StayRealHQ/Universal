import { ApnsClient, Notification, Host, type ApnsOptions, ApnsError } from "apns2";
import { clearIOSDevice, getIOSDevicesForRegion } from "./database";
import fs from "node:fs/promises";
import path from "node:path";

const createNotificationIOS = (token: string): Notification => {
  return new Notification(token, {
    alert: {
      title: "It's time for the moment !",
      body: "You have 2 minutes to capture a moment"
    },

    // Prevent duplicate notifications when the previous one
    // hasn't been read or dismissed.
    collapseId: "moment",
  });
};

const options: ApnsOptions = {
  team: process.env.TEAM_ID!,
  keyId: process.env.KEY_ID!,
  signingKey: await fs.readFile(path.join(import.meta.dirname, "..", "auth-key.p8"), "utf8"),
  defaultTopic: "com.vexcited.stayreal",
  requestTimeout: 0,
  keepAlive: true
}

const productionApns = new ApnsClient({
  ...options,
  host: Host.production
});

const debugApns = new ApnsClient({
  ...options,
  host: Host.development
});

export const batchApnsNotificationForRegion = async (region: string): Promise<void> => {
  const devices = await getIOSDevicesForRegion(region);

  await Promise.all(
    devices.map(async ({ id, token, debug }) => {
      const notification = createNotificationIOS(token);
      const client = debug ? debugApns : productionApns;
      await client.send(notification)
        .catch((error) => {
          if (error instanceof ApnsError) {
            switch (error.reason) {
              case "BadDeviceToken": {
                clearIOSDevice(id)
                  .then(() => console.warn("[ios]: cleared", id, "because token expired"))
                break;
              }
              default: {
                console.error("[ios]: issue with", id, "because", error.reason);
                break;
              }
            }
          }
        });
    })
  );
}
