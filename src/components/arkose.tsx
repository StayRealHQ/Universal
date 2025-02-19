import { BEREAL_IOS_BUNDLE_ID, BEREAL_IOS_VERSION, BEREAL_PLATFORM_VERSION } from "~/api/constants";

export const createArkoseURL = (key: string, dataExchange: string, deviceId: string) => {
  const href = window.location.origin + window.location.pathname;

  const html = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale=1,user-scalable=0"><style>html,body{display:flex;justify-content:center;align-items:center;background:#000;height:100%;width:100%;overflow:hidden;position:fixed;margin:0;padding:0;color:#fff}.spin{transition: opacity .175s; animation: spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}</style>`
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
      [p+"app_version"]:${JSON.stringify(BEREAL_IOS_VERSION)},
      [p+"battery_capacity"]:100,
      [p+"manufacturer"]:"Apple",
      [p+"app_id"]:${JSON.stringify(BEREAL_IOS_BUNDLE_ID)},
      [p+"app_signing_credential"]:"",
      [p+"device_orientation"]:"Un",
      [p+"brand"]:"Apple",
      [p+"userAgentModified"]:"",
      [p+"battery_status"]:"Full",
      [p+"id_for_vendor"]:${JSON.stringify(deviceId)},
      [p+"build_version"]:"2.4.0(2.4.0)",
      [p+"os_version"]:${JSON.stringify(BEREAL_PLATFORM_VERSION)},
      [p+"screen_brightness"]:100,
      [p+"storage_info"]:[]
    })))
  }
})
}</script>`
    + `</head><body id="challenge"><svg class="spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8"/></svg></body></html>`;
  return "data:text/html;base64," + btoa(html);
};
