import { BEREAL_DEFAULT_HEADERS } from "~/api/constants";
import { BeRealError } from "~/api/models/errors";
import { fetch } from "@tauri-apps/plugin-http";

export const VonageRequestCodeTokenIdentifier = {
  RECAPTCHA: "RE",
  ARKOSE: "AR"
} as const;

export type VonageRequestCodeTokenIdentifier = typeof VonageRequestCodeTokenIdentifier[keyof typeof VonageRequestCodeTokenIdentifier];

export interface VonageRequestCodeToken {
  token: string
  identifier: VonageRequestCodeTokenIdentifier
}

/**
 * Will send an otp code to the phone number.
 */
export const vonage_request_code = async (inputs: {
  deviceID: string
  phoneNumber: string
  tokens: VonageRequestCodeToken[]
}): Promise<string> => {
  const response = await fetch("https://auth-l7.bereal.com/api/vonage/request-code", {
    method: "POST",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(inputs.deviceID),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tokens: inputs.tokens,
      phoneNumber: inputs.phoneNumber,
      deviceId: inputs.deviceID,
    }),
  });

  if (response.status !== 200)
    throw new BeRealError("Not able to send SMS for this phone number, please check the phone number and try again.");

  const json = await response.json() as {
    vonageRequestId: string
    status: "0"
  };

  return json.vonageRequestId;
};
