import { cert, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getMessaging } from "firebase-admin/messaging"

import serviceAccount from './service-account.json';
import { fileExists } from './src/utils';

import fs from "node:fs/promises";
import path from "node:path";

const regions = [
  "us-central",
  "europe-west",
  "asia-west",
  "asia-east"
] as const;

type SavedMoment = Record<typeof regions[number], string>;

const savedMomentsFile = path.join(import.meta.dirname, "saved-moments.json");
let savedMoments: SavedMoment;
{
  if (await fileExists(savedMomentsFile)) {
    const savedMomentsTextFile = await fs.readFile(savedMomentsFile, "utf-8");
    savedMoments = JSON.parse(savedMomentsTextFile);
  }
  else {
    savedMoments = regions.reduce((acc, region) => {
      acc[region] = "";
      return acc;
    }, {} as SavedMoment);
  }
}

interface Moment {
  id: string
  startDate: string
  endDate: string
  region: typeof regions[number]
  timezone: string
  localTime: string
  localDate: string
}

const app = initializeApp({
  credential: cert(<ServiceAccount>serviceAccount),
});

const fetchRegion = async (region: typeof regions[number]): Promise<Moment> => {
  const moment: Moment = await fetch(`https://mobile-l7.bereal.com/api/bereal/moments/last/${region}`)
    .then(response => response.json());

  savedMoments[region] = moment.id;
  console.info(`[${region}]: ${moment.id}`);

  return moment;
};

/**
 * @returns true when moment is different from saved moment.
 */
const checkAndSend = async (moment: Moment): Promise<void> => {
  if (moment.id === savedMoments[moment.region]) return;

  await getMessaging(app)
    .send({
      topic: moment.region,
      data: {
        id: moment.id,
        region: moment.region,
        timezone: moment.timezone,
        startDate: moment.startDate,
        endDate: moment.endDate,
      }
    });

  console.info(`[${moment.region}]: found update and sent to FCM.`);
}

const processRegion = async (region: typeof regions[number]): Promise<void> => {
  const moment = await fetchRegion(region);
  await checkAndSend(moment);
};

const callAllRegions = async (): Promise<void> => {
  console.info(`\n${new Date().toISOString()}: will proceed to refetch moments.`);
  await Promise.all(regions.map(processRegion));
  await fs.writeFile(savedMomentsFile, JSON.stringify(savedMoments, null, 2));
};

setInterval(callAllRegions, 5000);
callAllRegions();
