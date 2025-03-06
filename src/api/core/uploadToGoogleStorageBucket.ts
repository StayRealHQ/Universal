import { fetch } from "@tauri-apps/plugin-http";
import { BEREAL_IOS_BUILD } from "../constants";

const uploadToGoogleStorageBucket = async (url: string, headers: Record<string, string>, file: Blob): Promise<void> => {
  // Just a little tweak, in case Google Cloud Storage starts being picky...
  headers["User-Agent"] = `BeReal/${BEREAL_IOS_BUILD} CFNetwork/3826.500.91 Darwin/24.4.0`;

  const response = await fetch(url, {
    method: "PUT",
    body: file,
    headers
  });

  if (response.status !== 200)
    throw new Error("Failed to upload, file may be too big!");
};

export default uploadToGoogleStorageBucket;
