import express from "express";

import { getLastMomentForRegion, setIOSDevice, setLastMomentForRegion } from "./database";
import { batchApnsNotificationForRegion } from "./ios";
import { sendFcmDataForMoment } from "./firebase";
import { fetchMomentForRegion } from "./api";
import { regions } from "./constants";

// This is the routine that will run every 5 seconds.
// It will check for updates in the moments and send
// notifications to the devices.
const routine = () => Promise.all(
  regions.map(async (region) => {
    try {
      const moment = await fetchMomentForRegion(region);
      const lastMomentId = await getLastMomentForRegion(region);

      // We don't need to do anything.
      if (moment.id === lastMomentId) return;
      await setLastMomentForRegion(region, moment.id);

      await Promise.all([
        batchApnsNotificationForRegion(region),
        sendFcmDataForMoment(moment)
      ]);
    } catch (error) {
      console.error(`[${region}]:`, error);
    }
  })
);

// We need a web interface so iOS devices can register.
const web = express();

// Here we don't check authentication because we're
// just trying to replicate a broadcast server.
//
// Sadly, APNS doesn't allow us to send to a topic
// just like FCM, so we need to register devices
// and send to them individually.
web.get("/ios/register/:id/:region/:token/:debug", async (req, res) => {
  // NOTE: `debug` can be "1" or "0".
  const { id, region, token, debug } = req.params;

  await setIOSDevice(id, debug === "1", token, region);
  res.status(200).send("OK");
});

// Start the web server.
web.listen(8000);

// Start the routine every 5 seconds.
setInterval(routine, 5000);
