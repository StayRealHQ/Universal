import { BEREAL_IOS_BUNDLE_ID, BEREAL_IOS_VERSION, BEREAL_PLATFORM_VERSION } from "~/api/constants";

import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex, randomBytes } from '@noble/hashes/utils';

const between = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const createArkoseURL = (key: string, dataExchange: string, deviceId: string) => {
  // After the challenge, we have to go back to our Tauri app.
  const callback = window.location.origin + window.location.pathname;

  // Timestamp as of right now to generate the biometric motion data.
  const timestamp = Math.floor(Date.now() / 1000);

  // @see https://appledb.dev/device/iPhone-15-Pro.html
  // Currently: iPhone 15 Pro
  const product = "iPhone16,1";

  const html = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale=1,user-scalable=0"><style>html,body{display:flex;justify-content:center;align-items:center;background:black;height:100%;width:100%;overflow:hidden;position:fixed;margin:0;padding:0;color:#fff}.spin{transition: opacity .175s; animation: spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}</style>`
    + `<script crossorigin="anonymous" data-callback="setup" src="https://client-api.arkoselabs.com/v2/api.js" async defer></script>`
    + `<script>
function setup(enforcement){
enforcement.setConfig({
  selector:'#challenge',
  publicKey:"${key}",
  mode:'inline',
  data:{blob:"${dataExchange}"},
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
      [p+"os_version"]:"${BEREAL_PLATFORM_VERSION}",
      [p+"userAgentModified"]:"",
      [p+"biometrics_proximity"]:"false,0",
      [p+"build_version"]:"2.4.0(2.4.0)",
      [p+"product"]:"${product}",
      [p+"device_orientation"]:"P",
      [p+"battery_status"]:"${Math.random() > .5 ? "Charging" : "Unplugged"}",
      [p+"battery_capacity"]:${between(10, 90)},
      [p+"device"]:"${product}",
      [p+"app_id"]:"${BEREAL_IOS_BUNDLE_ID}",
      [p+"screen_width"]:393,
      [p+"app_version"]:"${BEREAL_IOS_VERSION}",
      [p+"brand"]:"Apple",
      [p+"storage_info"]:[],
      [p+"manufacturer"]:"Apple",
      [p+"screen_height"]:852,
      [p+"errors"]:"[mobile_sdk__app_signing_credential,Data collection is not from within an app on device]",
      [p+"id_for_vendor"]:"${deviceId.toUpperCase()}",
      [p+"language"]:"en",
      [p+"screen_brightness"]:${between(5, 100)},
      [p+"app_signing_credential"]:"",
      [p+"locale_hash"]:"${bytesToHex(sha256(randomBytes()))}",
      [p+"codec_hash"]:"${bytesToHex(sha256(randomBytes()))}",
      [p+"device_name"]:"${bytesToHex(sha256(randomBytes()))}",
      [p+"cpu_cores"]:6,
      [p+"icloud_ubiquity_token"]:"${bytesToHex(sha256(randomBytes()))}",
      [p+"bio_fingerprint"]:3,
      [p+"gpu"]:"Apple,Apple A17 Pro GPU",
      [p+"device_arch"]:"arm64e",
      [p+"model"]:"D83AP",
      [p+"kernel"]:"Darwin Kernel Version 25.0.0: Fri May 30 19:46:56 PDT 2025; root:xnu-12377.0.81.0.3~311/RELEASE_ARM64_T8122",
      [p+"country_region"]:"US",
      [p+"timezone_offset"]:0,
      [p+"biometric_orientation"]:"1;${timestamp};0,17.65,-11.58,1.80;199,17.27,-11.30,1.79;288,17.07,-11.13,1.73;313,16.47,-10.99,1.81;444,16.28,-10.97,1.87;526,16.18,-10.79,1.77;596,16.00,-10.67,1.78;736,15.94,-10.62,1.73;821,15.79,-10.46,1.65;891,15.54,-10.30,1.55;991,15.05,-10.09,1.37;1090,14.95,-10.05,1.30;1190,14.71,-10.02,1.18;1289,14.43,-9.86,1.07;1389,13.29,-9.42,0.76;1488,12.94,-9.23,1.23;1588,13.56,-9.09,1.98;1688,14.32,-9.26,2.13;1787,14.91,-9.49,2.09;1887,15.07,-11.12,1.94;1986,16.27,-11.97,2.22;2086,17.23,-11.93,1.99;2185,15.82,-11.01,1.31;2285,15.25,-10.41,0.94;2384,15.02,-9.84,0.65;2484,14.79,-9.69,0.60;2583,14.68,-9.61,0.58;2683,14.53,-9.45,0.52;2783,13.89,-9.32,0.43;2882,13.85,-9.46,0.35;2982,14.13,-9.67,0.27;3081,14.13,-9.78,0.18;3181,13.78,-9.67,-0.05;3280,13.86,-9.66,-0.07;3380,13.68,-9.55,-0.16;3480,13.55,-9.42,-0.26;3579,13.49,-9.37,-0.34;3679,13.33,-9.22,-0.45;3778,12.87,-9.09,-0.51;3878,13.25,-9.00,-0.27;3977,15.62,-9.69,0.16;4077,15.69,-10.19,0.19;4176,14.53,-9.51,-0.08;4276,14.36,-9.25,-0.19;4377,14.05,-8.96,-0.31;4476,13.89,-8.82,-0.37;4575,13.96,-8.79,-0.38;4674,13.99,-8.82,-0.39;4774,13.88,-8.71,-0.43;4873,13.77,-8.56,-0.49;",
      [p+"biometric_motion"]:"1;${timestamp};0,0.12,-0.08,-0.06,-1.76,-3.05,-9.22,-7.78,2.78,-0.32;199,-0.03,0.05,0.03,-1.87,-2.86,-9.15,-2.04,3.19,-0.24;288,0.04,0.00,-0.04,-1.77,-2.88,-9.24,-0.27,0.13,0.57;313,0.02,-0.02,-0.07,-1.78,-2.80,-9.30,-9.38,2.57,2.44;444,-0.06,0.07,0.00,-1.86,-2.68,-9.24,-0.37,0.80,-0.32;526,0.11,-0.02,-0.02,-1.65,-2.75,-9.27,-4.02,0.83,0.52;596,0.00,0.02,-0.04,-1.75,-2.69,-9.30,-0.42,1.43,-0.40;736,0.01,-0.03,0.03,-1.73,-2.72,-9.24,-1.17,-0.10,-0.03;821,-0.01,0.03,-0.00,-1.72,-2.64,-9.29,-1.64,2.37,-0.53;891,0.01,0.02,0.06,-1.68,-2.61,-9.24,-4.67,1.69,-0.34;991,0.03,-0.01,-0.13,-1.63,-2.56,-9.46,-3.10,1.52,-0.86;1090,-0.01,-0.02,0.03,-1.66,-2.55,-9.30,-0.77,0.16,-1.17;1190,-0.03,0.02,0.02,-1.68,-2.47,-9.32,-2.09,1.52,-1.35;1289,-0.07,0.03,0.12,-1.70,-2.41,-9.24,-4.18,2.33,-0.97;1389,0.03,-0.07,-0.09,-1.53,-2.33,-9.51,-17.14,3.17,0.86;1488,0.06,-0.02,-0.15,-1.47,-2.21,-9.59,9.64,2.44,5.81;1588,-0.02,-0.04,0.03,-1.53,-2.34,-9.39,5.56,0.03,2.73;1688,0.07,-0.00,0.10,-1.46,-2.43,-9.28,9.55,0.15,0.69;1787,0.06,-0.06,-0.19,-1.51,-2.58,-9.54,7.98,-9.41,-4.50;1887,-0.10,0.03,-0.15,-1.92,-2.52,-9.45,1.26,-10.51,5.93;1986,-0.10,0.02,0.19,-2.05,-2.73,-9.02,10.22,-4.46,-5.73;2086,0.14,-0.04,0.35,-1.80,-2.95,-8.81,5.65,9.00,3.23;2185,-0.06,-0.08,-0.22,-1.86,-2.76,-9.48,-18.37,8.98,-7.04;2285,-0.07,0.14,-0.03,-1.79,-2.44,-9.34,0.69,4.63,-1.27;2384,0.17,-0.12,0.11,-1.45,-2.67,-9.22,-7.33,2.86,-0.33;2484,-0.02,0.03,-0.02,-1.61,-2.47,-9.37,2.26,1.26,-0.74;2583,-0.02,0.04,-0.03,-1.60,-2.44,-9.38,-2.43,0.60,0.60;2683,0.05,-0.11,0.05,-1.51,-2.57,-9.32,-2.41,1.87,-0.23;2783,-0.04,-0.04,-0.13,-1.59,-2.39,-9.53,-6.71,-0.73,-1.89;2882,-0.08,0.06,0.01,-1.65,-2.29,-9.39,4.24,-1.83,-0.25;2982,0.02,0.01,-0.00,-1.58,-2.38,-9.38,2.72,-2.49,0.17;3081,0.05,-0.00,0.08,-1.57,-2.40,-9.30,-4.15,-1.23,-1.96;3181,0.03,0.01,-0.14,-1.58,-2.33,-9.53,-1.12,1.42,-1.27;3280,-0.05,-0.03,0.10,-1.65,-2.38,-9.29,-1.02,1.19,-0.79;3380,-0.03,0.03,-0.01,-1.62,-2.29,-9.41,-1.48,1.58,-0.68;3480,-0.03,-0.02,-0.01,-1.59,-2.32,-9.42,-1.04,0.39,-0.90;3579,-0.11,-0.02,0.06,-1.67,-2.31,-9.35,-2.12,3.00,-1.23;3679,-0.01,0.03,0.00,-1.54,-2.23,-9.42,-1.16,0.75,0.34;3778,0.02,0.00,-0.13,-1.49,-2.18,-9.58,-7.10,0.58,1.44;3878,0.20,-0.06,-0.26,-1.30,-2.31,-9.69,14.37,-5.73,-2.26;3977,0.32,0.04,0.38,-1.27,-2.60,-8.94,24.11,-5.47,0.95;4077,-0.14,0.03,0.48,-1.81,-2.62,-8.82,-18.56,5.91,0.81;4176,0.03,0.07,-0.31,-1.54,-2.39,-9.68,0.25,1.80,-1.04;4276,0.02,0.02,0.02,-1.50,-2.41,-9.36,-4.83,3.09,-0.30;4377,-0.02,-0.01,-0.08,-1.50,-2.39,-9.48,-1.26,1.49,-0.64;4476,-0.01,0.01,-0.03,-1.47,-2.35,-9.44,-1.37,0.29,0.49;4575,0.10,-0.05,-0.05,-1.35,-2.41,-9.45,2.21,-1.12,0.11;4674,-0.00,-0.02,-0.01,-1.46,-2.39,-9.41,-0.87,0.78,-0.88;4774,-0.03,0.02,0.03,-1.48,-2.34,-9.39,-1.72,2.14,-0.78;4873,-0.03,0.02,0.08,-1.45,-2.31,-9.35,-2.49,1.16,-0.77;"
    })))
  }
})
}</script>`
    + `</head><body id="challenge"><svg class="spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8"/></svg></body></html>`;
  return "data:text/html;base64," + btoa(html);
};
