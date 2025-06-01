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
      [p+"battery_status"]:${conv(Math.random() > .5 ? "Charging" : "Unplugged")},
      [p+"battery_capacity"]:${between(10, 90)},
      [p+"device"]:${conv(product)},
      [p+"app_id"]:${conv(BEREAL_IOS_BUNDLE_ID)},
      [p+"screen_width"]:393,
      [p+"app_version"]:${conv(BEREAL_IOS_VERSION)},
      [p+"brand"]:"Apple",
      [p+"storage_info"]:[],
      [p+"manufacturer"]:"Apple",
      [p+"screen_height"]:852,
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
      [p+"biometric_orientation"]:"1;${timestamp};0,31.39,-4.27,1.20;137,32.01,-4.09,1.38;217,33.18,-2.98,1.38;338,34.32,-1.56,1.38;408,35.28,-0.10,1.40;489,35.79,0.74,1.25;591,35.33,0.25,1.55;688,32.34,-3.34,3.31;787,29.46,-6.52,5.88;887,27.39,-9.20,7.35;987,26.42,-10.99,8.00;1086,26.35,-10.95,7.77;1186,26.78,-10.20,7.51;1285,28.52,-8.18,7.19;1385,30.76,-5.69,6.51;1484,30.33,-5.88,6.36;1584,29.45,-6.72,6.75;1684,29.42,-6.65,6.72;1784,29.36,-6.83,6.64;1883,28.58,-7.71,6.75;1982,28.14,-8.20,6.79;2082,28.22,-8.29,6.77;2182,27.75,-8.70,7.28;2281,26.12,-9.97,7.95;2380,25.14,-10.92,8.51;2480,25.19,-11.31,8.50;2580,24.83,-11.62,8.48;2750,24.33,-11.71,8.15;2914,24.81,-11.47,8.15;3000,27.10,-9.03,8.07;3000,30.02,-5.98,6.73;3077,31.83,-3.92,5.06;3177,32.64,-2.79,3.94;3280,32.62,-2.28,3.00;3376,32.82,-1.42,2.15;3480,33.13,-1.41,2.04;3575,33.11,-1.20,2.32;3675,32.87,-0.80,2.24;3775,32.83,-1.06,2.26;3874,32.76,-1.21,2.51;3974,32.33,-1.92,3.48;4073,32.39,-3.36,4.45;4173,32.80,-4.41,5.13;4272,32.53,-5.50,5.92;4372,32.59,-6.19,6.34;4471,32.47,-6.24,6.44;4571,32.11,-5.74,6.71;4671,31.42,-5.98,7.27;4770,31.27,-6.13,7.43;4870,31.07,-6.38,7.46;",
      [p+"biometric_motion"]:"1;${timestamp};0,-0.04,-0.07,-0.01,-0.66,-5.18,-8.36,6.07,0.61,1.48;137,-0.25,0.08,-0.07,-0.85,-5.12,-8.37,9.18,5.03,-1.77;217,-0.01,-0.07,0.01,-0.43,-5.44,-8.19,10.05,11.07,-1.27;338,-0.05,-0.09,0.37,-0.27,-5.62,-7.72,5.08,10.13,0.67;408,-0.13,-0.00,0.28,-0.15,-5.67,-7.73,9.22,13.73,-1.25;489,0.09,-0.01,0.21,0.19,-5.75,-7.75,-1.36,1.01,-2.01;591,0.32,-0.24,0.52,0.36,-5.91,-7.49,-15.98,-15.89,8.35;688,0.19,-0.19,0.02,-0.30,-5.44,-8.26,-28.21,-18.84,22.58;787,-0.33,0.09,-0.20,-1.30,-4.74,-8.69,-19.96,-10.96,22.81;887,-0.15,0.12,-0.23,-1.54,-4.39,-8.82,-17.66,-24.48,12.16;987,-0.26,0.18,0.05,-1.93,-4.19,-8.58,-5.23,-12.62,2.96;1086,-0.09,0.01,-0.07,-1.75,-4.34,-8.70,-6.56,-6.71,-5.16;1186,-0.07,-0.00,0.01,-1.62,-4.42,-8.61,4.60,8.09,-2.52;1285,-0.32,0.02,-0.14,-1.55,-4.66,-8.67,30.28,34.18,-5.87;1385,0.15,-0.19,0.61,-0.68,-5.21,-7.78,5.41,4.54,-6.96;1484,0.04,-0.11,0.08,-0.83,-5.06,-8.34,-5.64,-3.75,1.73;1584,-0.14,0.07,-0.07,-1.14,-4.75,-8.55,-8.15,-7.13,3.59;1684,-0.29,0.05,-0.04,-1.28,-4.76,-8.53,7.30,9.18,-3.16;1784,0.21,-0.13,0.01,-0.81,-4.94,-8.48,-2.38,-2.61,1.89;1883,-0.04,0.01,-0.06,-1.20,-4.68,-8.59,-8.50,-11.31,1.74;1982,0.06,0.01,0.03,-1.18,-4.62,-8.53,2.63,3.09,1.21;2082,0.18,-0.12,0.22,-1.06,-4.76,-8.34,0.80,-0.07,2.35;2182,0.07,-0.08,0.35,-1.25,-4.65,-8.23,-10.08,-3.69,9.18;2281,-0.02,-0.03,-0.09,-1.54,-4.35,-8.76,-16.87,-12.80,8.82;2380,-0.35,0.20,-0.39,-2.04,-3.97,-9.11,0.36,-0.13,4.06;2480,0.04,-0.07,0.17,-1.70,-4.25,-8.54,-0.97,-2.23,-1.72;2580,-0.08,-0.06,0.22,-1.88,-4.18,-8.50,-11.44,-10.21,0.34;2750,0.04,-0.00,-0.29,-1.77,-4.04,-9.04,-0.65,-1.61,-2.48;2914,-0.05,-0.05,0.15,-1.82,-4.17,-8.57,5.13,5.13,-1.11;3000,-0.52,0.33,-0.32,-1.89,-4.14,-8.94,43.63,47.44,-11.99;3000,-0.03,0.02,0.08,-0.92,-4.89,-8.37,11.47,3.56,-20.38;3077,0.05,-0.09,0.21,-0.52,-5.26,-8.10,18.03,15.65,-12.89;3177,-0.01,-0.09,0.28,-0.42,-5.39,-7.97,-1.17,-2.76,-8.10;3280,-0.14,-0.02,-0.01,-0.47,-5.31,-8.27,0.21,2.74,-7.23;3376,0.18,0.07,-0.85,-0.02,-5.25,-9.09,14.66,9.72,-4.50;3480,-0.00,-0.17,0.12,-0.20,-5.53,-8.09,-1.01,-4.33,4.73;3575,-0.23,0.04,0.19,-0.41,-5.32,-8.02,-2.75,4.55,-0.35;3675,0.05,-0.10,-0.22,-0.06,-5.42,-8.46,-1.37,1.94,-1.06;3775,0.03,-0.03,0.12,-0.12,-5.35,-8.12,1.69,-2.86,1.91;3874,0.25,-0.11,0.05,0.08,-5.42,-8.19,-2.92,-1.98,3.48;3974,0.05,0.12,-0.49,-0.23,-5.13,-8.78,-3.54,-4.74,10.82;4073,-0.16,-0.01,-0.02,-0.65,-5.26,-8.29,5.17,-11.34,7.84;4173,-0.09,-0.02,0.31,-0.72,-5.34,-7.91,0.33,-8.29,7.41;4272,-0.23,0.11,-0.00,-1.03,-5.16,-8.24,-2.58,-3.55,6.20;4372,-0.01,0.01,0.29,-0.91,-5.27,-7.93,1.73,-4.73,4.17;4471,-0.05,-0.11,0.22,-0.95,-5.37,-8.01,-0.75,3.01,-0.01;4571,0.05,-0.08,-0.14,-0.78,-5.30,-8.40,-4.83,6.49,5.86;4671,-0.19,0.01,-0.24,-1.07,-5.10,-8.57,-7.72,-4.22,5.14;4770,-0.04,0.03,0.05,-0.93,-5.06,-8.28,2.98,4.09,2.16;4870,0.05,-0.05,0.01,-0.89,-5.11,-8.34,-1.76,1.44,0.33;"
    })))
  }
})
}</script>`
    + `</head><body id="challenge"><svg class="spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8"/></svg></body></html>`;
  return "data:text/html;base64," + btoa(html);
};
