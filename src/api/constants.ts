import { hex } from '@scure/base';
import { createBeRealSignature } from "./core/signature";

export const BEREAL_IOS_BUNDLE_ID = "AlexisBarreyat.BeReal";
export const BEREAL_IOS_VERSION = "4.13.0";
export const BEREAL_IOS_BUILD = "19929";
export const BEREAL_TIMEZONE = new Intl.DateTimeFormat().resolvedOptions().timeZone;
export const BEREAL_ARKOSE_PUBLIC_KEY = "CCB0863E-D45D-42E9-A6C8-9E8544E8B17E";
export const BEREAL_HMAC_KEY = hex.decode('3536303337663461663232666236393630663363643031346532656337316233')
export const BEREAL_FIREBASE_KEY = "AIzaSyCgNTZt6gzPMh-2voYXOvrt_UR_gpGl83Q";
export const BEREAL_CLIENT_SECRET = "962D357B-B134-4AB6-8F53-BEA2B7255420";

export const BEREAL_PLATFORM = "iOS";
export const BEREAL_PLATFORM_VERSION = "18.4";

export const BEREAL_DEFAULT_HEADERS = (deviceID: string) => ({
  "bereal-platform": BEREAL_PLATFORM,
  "bereal-os-version": BEREAL_PLATFORM_VERSION,
  "bereal-app-version": BEREAL_IOS_VERSION,
  "bereal-app-version-code": BEREAL_IOS_BUILD,
  "bereal-device-language": "en",
  "bereal-app-language": "en-US",
  "bereal-timezone": BEREAL_TIMEZONE,
  "bereal-device-id": deviceID,
  "bereal-experiment-new-design": "false",
  "bereal-experiment-ranking": "false",
  "bereal-experiment-new-profile": "false",
  "bereal-experiment-unlimited-bereals": "false",
  "bereal-signature": createBeRealSignature(deviceID),
  "user-agent": `BeReal/${BEREAL_IOS_VERSION} (${BEREAL_IOS_BUNDLE_ID}; build:${BEREAL_IOS_BUILD}; ${BEREAL_PLATFORM} ${BEREAL_PLATFORM_VERSION}.0)`
});
