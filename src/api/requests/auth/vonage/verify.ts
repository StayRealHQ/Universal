import { BEREAL_DEFAULT_HEADERS } from "~/api/constants";
import { BeRealError } from "~/api/models/errors";
import { fetch } from "@tauri-apps/plugin-http";

/**
 * will check the otp code and return
 * the google firebase token for the user.
 */
export const vonage_verify_otp = async (inputs: {
  otp: string
  deviceID: string,
  requestID: string,
}): Promise<string> => {
  const response = await fetch("https://auth-l7.bereal.com/api/vonage/check-code", {
    method: "POST",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(inputs.deviceID),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: inputs.otp,
      vonageRequestId: inputs.requestID
    }),
  });

  const json = await response.json() as {
    status: "16" // incorrect code
  } | {
    status: "0"
    token: string
    uid: string
  }

  if (json.status !== "0")
    throw new BeRealError("Incorrect OTP code.");

  return json.token;
};
