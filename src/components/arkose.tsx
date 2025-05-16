import { BEREAL_IOS_BUNDLE_ID, BEREAL_IOS_VERSION, BEREAL_PLATFORM_VERSION } from "~/api/constants";

import { v4 as uuidv4 } from "uuid";
import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex } from '@noble/hashes/utils';

/**
 * A cute little converter for some values sent to Arkose
 * through the `bda` form value.
 */
const conv = (v: any | Array<any>): string => {
  if (Array.isArray(v)) {
    v = v.join(",");
    v = `[${v}]`;
  }

  return JSON.stringify(v);
};

const between = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Prevents kernel strings to be blocked
 * in the future.
 */
const anyKernel = (): string => {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const weekday = weekdays[between(0, 6)];
  const month = months[between(0, 11)];
  const day = between(1, 31).toString().padStart(2, '0');
  const hour = between(0, 23).toString().padStart(2, '0');
  const minute = between(0, 59).toString().padStart(2, '0');
  const second = between(0, 59).toString().padStart(2, '0');
  const timezone = 'PDT';
  const year = new Date().getFullYear();

  const buildVersion = [
    between(10000, 12000),
    between(50, 150),
    between(10, 99),
    between(100, 999),
    between(0, 9)
  ].join('.');

  const tilde = `~${between(1, 5)}`;
  // @see https://theapplewiki.com/wiki/T8130, which is the one used
  //      by the iPhone 15 Pro (A17 Pro)
  const arch = `RELEASE_ARM64_T8130`;

  const [osVersion, osSubVersion] = BEREAL_PLATFORM_VERSION.split(".");

  return `Darwin Kernel Version ${23+(17-parseInt(osVersion))}.${osSubVersion}.0: ${weekday} ${month} ${day} ${hour}:${minute}:${second} ${timezone} ${year}; root:xnu-${buildVersion}${tilde}/${arch}`;
}

export const createArkoseURL = (key: string, dataExchange: string, deviceId: string) => {
  // After the challenge, we have to go back to our Tauri app.
  const callback = window.location.origin + window.location.pathname;

  // Timestamp as of right now to generate the biometric motion data.
  const timestamp = Math.floor(Date.now() / 1000);

  // Current languages to generate the locale hash.
  const locales = conv(navigator.languages);

  // @see https://developer.mozilla.org/docs/Web/Media/Formats/Audio_codecs
  // @see https://developer.mozilla.org/docs/Web/Media/Guides/Formats/Video_codecs
  const codecs = conv(["mp4a.40.2", "vorbis", "opus", "theora", "vorbis"]);

  // @see https://appledb.dev/device/iPhone-15-Pro.html
  // Currently: iPhone 15 Pro
  const model = "D83AP";
  const product = "iPhone16,1";

  const html = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale=1,user-scalable=0"><style>html,body{display:flex;justify-content:center;align-items:center;background:black;height:100%;width:100%;overflow:hidden;position:fixed;margin:0;padding:0;color:#fff}.spin{transition: opacity .175s; animation: spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}</style>`
    + `<script crossorigin="anonymous" data-callback="setup" src="https://client-api.arkoselabs.com/v2/api.js" async defer></script>`
    + `<script>
function setup(enforcement){
enforcement.setConfig({
  selector:'#challenge',
  publicKey:${conv(key)},
  mode:'inline',
  data:{blob:${conv(dataExchange)}},
  isSDK:true,
  accessibilitySettings:{lockFocusToModal:true},
  onCompleted({token}){
    location.href = \`${callback}?arkoseToken=\${token}\`
  },
  onShow(){
    document.querySelector('.spin').style.opacity = 0
  },
  onDataRequest(){
    const p="mobile_sdk__"
    enforcement.dataResponse(btoa(JSON.stringify({
      [p+"os_version"]:${conv(BEREAL_PLATFORM_VERSION)},
      [p+"userAgentModified"]:"",
      [p+"biometrics_proximity"]:"false,0",
      [p+"build_version"]:"2.4.0(2.4.0)",
      [p+"product"]:${conv(product)},
      [p+"device_orientation"]:"P",
      [p+"battery_status"]:"Unplugged",
      [p+"battery_capacity"]:${between(10, 90)},
      [p+"device"]:${conv(product)},
      [p+"app_id"]:${conv(BEREAL_IOS_BUNDLE_ID)},
      [p+"screen_width"]:window.innerWidth,
      [p+"app_version"]:${conv(BEREAL_IOS_VERSION)},
      [p+"brand"]:"Apple",
      [p+"storage_info"]:[],
      [p+"manufacturer"]:"Apple",
      [p+"screen_height"]:window.innerHeight,
      [p+"errors"]:${conv(["mobile_sdk__app_signing_credential", "Data collection is not from within an app on device"])},
      [p+"id_for_vendor"]:${conv(deviceId)},
      [p+"language"]:"en",
      [p+"screen_brightness"]:${between(5, 100)},
      [p+"app_signing_credential"]:"",
      [p+"locale_hash"]:${conv(bytesToHex(sha256(locales)))},
      [p+"codec_hash"]:${conv(bytesToHex(sha256(codecs)))},
      [p+"device_name"]:${conv(bytesToHex(sha256(deviceId)))},
      [p+"cpu_cores"]:6,
      [p+"icloud_ubiquity_token"]:${conv(bytesToHex(sha256(uuidv4())))},
      [p+"bio_fingerprint"]:3,
      [p+"gpu"]:"Apple,Apple A17 Pro GPU",
      [p+"device_arch"]:"arm64e",
      [p+"model"]:${conv(model)},
      [p+"kernel"]:${conv(anyKernel())},
      [p+"country_region"]:"US",
      [p+"timezone_offset"]:0,
      [p+"biometric_orientation"]:"1;${timestamp};0,27.33,-20.70,5.09;16,46.82,-19.91,-7.13;173,59.47,-17.58,-18.28;350,61.25,-22.42,-16.46;473,58.90,-22.13,-17.84;507,60.03,-20.99,-18.34;897,61.23,-20.00,-19.18;993,61.94,-11.23,-24.47;1206,59.56,1.12,-33.32;1206,65.31,-18.47,-23.29;1206,67.33,-20.97,-22.63;1206,65.37,-10.53,-31.17;1206,63.81,-8.24,-33.44;1206,63.40,-6.82,-34.73;1275,63.70,-7.53,-34.36;1372,65.62,-7.57,-34.44;1471,56.89,25.15,-54.17;1571,17.73,54.07,-45.67;1682,18.05,45.77,-40.43;1795,15.77,15.65,-43.77;1936,24.38,-3.29,-47.38;1969,67.98,-65.51,-56.84;2069,85.09,107.44,80.35;2168,75.52,109.59,63.98;2268,76.83,109.71,63.74;2367,75.46,100.17,70.15;2467,73.88,97.40,72.49;2566,72.59,95.23,73.97;2666,73.08,91.87,77.57;2766,74.50,93.48,77.06;2865,79.39,94.87,81.62;2965,82.66,-44.62,-113.20;3064,58.94,-50.06,-75.84;3166,49.55,-41.55,-61.71;3263,39.97,-13.98,-51.32;3363,22.22,-2.45,-50.40;3463,23.99,-3.56,-50.68;3562,26.61,-7.01,-56.69;3662,25.41,-7.85,-56.13;3761,35.15,-9.56,-54.44;3861,45.55,-5.25,-52.81;3960,52.89,-3.02,-54.41;4060,55.74,-0.85,-57.01;4160,53.37,-2.76,-55.58;4259,51.76,-4.16,-57.59;4358,53.36,-4.15,-58.20;4458,49.99,-5.41,-56.71;4557,51.35,-7.09,-54.56;4657,52.34,-4.42,-53.87;4757,52.72,-4.01,-53.99;",
      [p+"biometric_motion"]:"1;${timestamp};0,-1.71,0.28,1.24,-4.79,-4.23,-6.92,202.65,-112.05,-159.05;16,2.13,3.79,0.41,-0.16,-3.36,-5.90,110.39,-90.56,-151.72;173,1.53,5.30,1.53,0.02,-3.15,-3.22,59.98,-33.44,-77.40;350,-1.71,-1.27,3.55,-3.51,-9.87,-0.81,-52.77,-48.17,29.41;473,0.23,-0.72,-0.43,-1.68,-9.12,-5.13,1.35,0.63,0.15;507,0.34,0.10,0.43,-1.41,-8.40,-4.14,1.84,22.19,-14.23;897,-0.08,-0.02,0.34,-1.69,-8.62,-4.10,3.09,1.57,-6.35;993,-1.38,-0.21,0.07,-2.28,-8.87,-4.46,-27.03,151.48,-64.61;1206,1.54,0.43,-1.14,1.64,-8.03,-6.11,31.03,-56.11,23.95;1206,-0.37,-0.59,-0.35,-1.67,-9.50,-4.23,52.35,-64.93,13.21;1206,-0.14,0.01,1.01,-1.50,-9.04,-2.52,-5.58,18.08,-19.97;1206,1.42,0.62,1.09,0.67,-8.30,-2.93,-29.83,-28.30,2.36;1206,-0.17,-0.37,-0.21,-0.79,-9.18,-4.49,-26.74,24.19,-22.91;1206,-0.01,-0.17,-0.13,-0.53,-8.94,-4.49,0.28,-0.99,-2.66;1275,0.29,0.29,0.13,-0.28,-8.51,-4.18,9.79,-11.90,6.71;1372,-0.22,0.15,0.47,-0.75,-8.78,-3.54,2.12,39.39,-27.88;1471,-1.95,0.29,4.30,0.33,-7.93,-0.55,-242.83,368.77,-222.56;1571,3.55,1.73,-0.48,11.11,-1.26,-5.97,-284.34,16.77,-57.00;1682,0.51,-2.40,-2.55,7.19,-5.44,-9.05,111.63,-146.98,48.00;1795,0.50,-1.69,0.00,3.04,-4.35,-9.09,-132.16,-237.14,19.22;1936,-0.78,1.56,-6.69,-1.30,-2.49,-15.61,371.25,-251.72,-49.28;1969,-4.09,3.09,0.76,-7.44,-6.01,-0.77,156.32,-915.24,-341.74;2069,1.11,5.54,-4.93,1.91,-4.23,-4.68,26.05,-205.50,-147.20;2168,1.00,-0.72,0.33,3.31,-10.22,1.15,35.08,-43.58,-60.35;2268,-1.39,-1.06,1.52,0.72,-10.61,2.28,-18.98,-34.05,18.77;2367,0.01,-0.20,-0.01,2.44,-9.70,0.43,-2.28,-9.03,-16.96;2467,0.22,0.31,0.17,2.92,-9.12,0.52,-5.61,-11.57,-23.08;2566,0.81,0.06,0.11,3.73,-9.30,0.38,-5.42,4.28,2.40;2666,0.25,0.04,-0.15,3.10,-9.35,-0.06,-4.57,4.68,6.22;2766,0.25,0.13,0.34,2.86,-9.32,0.49,-2.97,6.91,9.23;2865,1.57,2.14,0.25,3.37,-7.50,0.40,-33.60,167.18,126.62;2965,0.36,4.62,-0.23,-0.52,-5.11,-1.13,-84.55,305.65,207.32;3064,-0.17,-0.92,-2.59,-4.05,-9.32,-5.84,-45.33,231.89,228.70;3166,-3.11,-3.09,0.28,-7.33,-10.56,-4.48,9.29,218.78,62.42;3263,-2.54,-0.99,6.09,-4.36,-7.29,-1.20,-222.63,225.53,62.47;3363,0.49,0.18,-2.40,0.10,-3.53,-11.47,-77.61,52.20,41.47;3463,-0.46,-0.86,0.17,-1.02,-4.84,-8.77,62.73,-81.40,-62.34;3562,0.93,-0.09,0.61,-0.14,-4.48,-8.10,-35.86,-25.51,-19.78;3662,-0.59,-0.04,-1.43,-1.80,-4.25,-10.21,45.90,-13.30,8.71;3761,-0.39,-0.52,-1.77,-1.72,-6.16,-9.68,123.69,46.80,-7.62;3861,-0.43,0.31,0.82,-1.06,-6.69,-6.02,92.37,-33.20,-11.63;3960,0.33,0.28,1.71,0.01,-7.54,-4.20,42.62,35.99,-22.12;4060,1.30,0.85,1.04,1.21,-7.26,-4.48,1.50,3.41,1.06;4160,0.37,-0.40,0.40,0.09,-8.28,-5.45,-44.46,-35.42,4.21;4259,0.41,-0.06,-1.29,-0.03,-7.77,-7.35,12.69,-8.36,-4.74;4358,0.43,0.16,0.73,0.00,-7.71,-5.11,9.13,-4.94,-3.14;4458,-0.19,-0.02,-0.74,-0.78,-7.54,-7.01,-44.18,14.92,19.70;4557,-0.71,-0.32,0.18,-1.46,-7.98,-5.90,47.66,-21.69,1.84;4657,0.07,-0.91,0.96,-0.39,-8.68,-5.02,-24.99,66.40,11.60;4757,-1.70,0.15,-3.04,-2.12,-7.66,-8.97,57.87,-0.20,-30.59;"
    })))
  }
})
}</script>`
    + `</head><body id="challenge"><svg class="spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8"/></svg></body></html>`;
  return "data:text/html;base64," + btoa(html);
};
