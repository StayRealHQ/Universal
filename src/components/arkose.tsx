import { BEREAL_IOS_BUNDLE_ID, BEREAL_IOS_VERSION, BEREAL_PLATFORM_VERSION } from "~/api/constants";

import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex } from '@noble/hashes/utils';

export const createArkoseURL = (key: string, dataExchange: string, deviceId: string) => {
  const href = window.location.origin + window.location.pathname;
  const locales = `[${navigator.languages.join(", ")}]`;
  const biometricTimestamp = Math.floor(Date.now() / 1000);

  const html = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale=1,user-scalable=0"><style>html,body{display:flex;justify-content:center;align-items:center;background:black;height:100%;width:100%;overflow:hidden;position:fixed;margin:0;padding:0;color:#fff}.spin{transition: opacity .175s; animation: spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}</style>`
    + `<script crossorigin="anonymous" data-callback="setup" src="https://client-api.arkoselabs.com/v2/api.js" async defer></script>`
    + `<script>
function setup(enforcement){
enforcement.setConfig({
  selector:'#challenge',
  publicKey:${JSON.stringify(key)},
  mode:'inline',
  data:{blob:${JSON.stringify(dataExchange)}},
  isSDK:true,
  accessibilitySettings:{lockFocusToModal:true},
  onCompleted({token}){
    location.href = \`${href}?arkoseToken=\${token}\`
  },
  onShow(){
    document.querySelector('.spin').style.opacity = 0
  },
  onDataRequest(){
    const p="mobile_sdk__"
    enforcement.dataResponse(btoa(JSON.stringify({
      [p+"os_version"]:${JSON.stringify(BEREAL_PLATFORM_VERSION)},
      [p+"userAgentModified"]:"",
      [p+"biometrics_proximity"]:"false,0",
      [p+"build_version"]:"2.4.0(2.4.0)",
      [p+"product"]:"iPhone15,3",
      [p+"device_orientation"]:"Un",
      [p+"battery_status"]:"Full",
      [p+"battery_capacity"]:100,
      [p+"device"]:"iPhone15,3",
      [p+"app_id"]:${JSON.stringify(BEREAL_IOS_BUNDLE_ID)},
      [p+"screen_width"]:window.innerWidth,
      [p+"app_version"]:${JSON.stringify(BEREAL_IOS_VERSION)},
      [p+"brand"]:"Apple",
      [p+"storage_info"]:[],
      [p+"manufacturer"]:"Apple",
      [p+"screen_height"]:window.innerHeight,
      [p+"errors"]:"[mobile_sdk__app_signing_credential,Data collection is not from within an app on device]",
      [p+"id_for_vendor"]:${JSON.stringify(deviceId)},
      [p+"language"]:"en",
      [p+"screen_brightness"]:100,
      [p+"app_signing_credential"]:"",
      [p+"locale_hash"]:${JSON.stringify(bytesToHex(sha256(locales)))},
      [p+"codec_hash"]:${JSON.stringify(bytesToHex(sha256("mp4a.40.2,vorbis,opus,theora,vorbis")))},
      [p+"device_name"]:${JSON.stringify(bytesToHex(sha256(deviceId)))},
      [p+"cpu_cores"]:8,
      [p+"icloud_ubiquity_token"]:"",
      [p+"bio_fingerprint"]:3,
      [p+"gpu"]:"Apple,Apple GPU",
      [p+"device_arch"]:"arm64e",
      [p+"kernel"]:"Darwin Kernel Version 24.4.0: Wed Mar 19 21:18:03 PDT 2025; root:xnu-11417.101.15~1/RELEASE_ARM64_T8112",
      [p+"biometric_orientation"]:"1;${biometricTimestamp};0,0.00,-0.00,-0.00;26,30.00,-0.00,-0.00;78,30.00,-0.00,-0.00;138,30.00,-0.00,-0.00;312,30.00,-0.00,-0.00;376,30.00,-0.00,-0.00;434,30.00,-0.00,-0.00;534,30.00,-0.00,-0.00;643,30.00,-0.00,-0.00;747,30.00,-0.00,-0.00;834,30.00,-0.00,-0.00;934,30.00,-0.00,-0.00;1034,30.00,-0.00,-0.00;1135,30.00,-0.00,-0.00;1234,30.00,-0.00,-0.00;1334,30.00,-0.00,-0.00;1434,30.00,-0.00,-0.00;1534,30.00,-0.00,-0.00;1635,30.00,-0.00,-0.00;1739,30.00,-0.00,-0.00;1834,30.00,-0.00,-0.00;1935,30.00,-0.00,-0.00;2034,30.00,-0.00,-0.00;2135,30.00,-0.00,-0.00;2235,30.00,-0.00,-0.00;2334,30.00,-0.00,-0.00;2434,30.00,-0.00,-0.00;2535,30.00,-0.00,-0.00;2634,30.00,-0.00,-0.00;2735,30.00,-0.00,-0.00;2834,30.00,-0.00,-0.00;2935,30.00,-0.00,-0.00;3035,30.00,-0.00,-0.00;3135,30.00,-0.00,-0.00;3234,30.00,-0.00,-0.00;3334,30.00,-0.00,-0.00;3435,30.00,-0.00,-0.00;3535,30.00,-0.00,-0.00;3634,30.00,-0.00,-0.00;3735,30.00,-0.00,-0.00;3834,30.00,-0.00,-0.00;3935,30.00,-0.00,-0.00;4035,30.00,-0.00,-0.00;4135,30.00,-0.00,-0.00;4235,30.00,-0.00,-0.00;4334,30.00,-0.00,-0.00;4435,30.00,-0.00,-0.00;4724,30.00,-0.00,-0.00;4726,30.00,-0.00,-0.00;4737,30.00,-0.00,-0.00;",
      [p+"biometric_motion"]:"1;${biometricTimestamp};0,0.00,0.00,0.00,0.00,0.00,-9.81,0.00,0.00,0.00;26,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,286.33,-76.72;78,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;138,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;312,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;376,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;434,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;534,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;643,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;747,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;834,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;934,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;1034,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;1135,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;1234,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;1334,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;1434,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;1534,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;1635,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;1739,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;1834,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;1935,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;2034,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;2135,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;2235,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;2334,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;2434,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;2535,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;2634,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;2735,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;2834,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;2935,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;3035,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;3135,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;3234,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;3334,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;3435,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;3535,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;3634,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;3735,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;3834,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;3935,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;4035,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;4135,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;4235,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;4334,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;4435,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;4724,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;4726,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;4737,0.00,0.00,0.00,0.00,-4.91,-8.50,0.00,0.00,0.00;"
    })))
  }
})
}</script>`
    + `</head><body id="challenge"><svg class="spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8"/></svg></body></html>`;
  return "data:text/html;base64," + btoa(html);
};
