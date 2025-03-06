import auth from "../../../../stores/auth";
import { BEREAL_DEFAULT_HEADERS } from "../../../constants";
import { fetch } from "@tauri-apps/plugin-http";

export interface ContentPostsUploadUrls {
  data: Array<{
    /** @example "https://storage.googleapis.com/.../Photos/.../post/..." */
    url: string
    expireAt: string
    bucket: string
    /** @example "Photos/:user_id/post/:post_id.webp" */
    path: string
    /**
     * contains `cache-control`, `content-type` and `x-goog-content-length-range`
     */
    headers: Record<string, string>
  }>
}

export const content_posts_upload_url = async (): Promise<ContentPostsUploadUrls> => {
  const response = await fetch("https://mobile-l7.bereal.com/api/content/posts/multi-format-upload-url?mimeTypes=image/webp&mimeTypes=image/webp", {
    method: "GET",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`
    }
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return content_posts_upload_url();
  }

  return response.json();
};



export const content_posts_create = async (inputs: {
  isLate: boolean
  retakeCounter: number
  frontBucketName: string,
  frontCameraPath: string
  frontCameraHeight: number
  frontCameraWidth: number,
  backBucketName: string,
  backCameraPath: string
  backCameraHeight: number
  backCameraWidth: number,
  location?: { longitude: number, latitude: number }
  takenAt: Date
}): Promise<void> => {
  const response = await fetch("https://mobile-l7.bereal.com/api/content/posts", {
    method: "POST",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      visibility: ["friends"],
      frontCamera: {
        bucket: inputs.frontBucketName,
        path: inputs.frontCameraPath,
        height: inputs.frontCameraHeight,
        width: inputs.frontCameraWidth,
        mediaType: "image"
      },
      postType: "default",
      isLate: inputs.isLate,
      retakeCounter: inputs.retakeCounter,
      location: inputs.location || null,
      backCamera: {
        bucket: inputs.backBucketName,
        path: inputs.backCameraPath,
        height: inputs.backCameraHeight,
        width: inputs.backCameraWidth,
        mediaType: "image"
      },
      takenAt: inputs.takenAt.toISOString()
    })
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return content_posts_create(inputs);
  }

  if (response.status !== 201) {
    throw new Error("failed to create post");
  }
};
