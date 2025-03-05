import { cert, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getMessaging } from "firebase-admin/messaging"
import certificate from '../service-account.json';
import type { MomentAPI } from './api';

export const firebase = initializeApp({
  credential: cert(<ServiceAccount>certificate),
});

export const sendFcmDataForMoment = async (moment: MomentAPI): Promise<void> => {
  await getMessaging(firebase)
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
}
