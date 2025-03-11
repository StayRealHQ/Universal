import { fetch } from "@tauri-apps/plugin-http";
import { BEREAL_DEFAULT_HEADERS } from "~/api/constants";
import { BeRealError } from "~/api/models/errors";
import auth from "~/stores/auth";

export enum PostReportReason {
  // NOTE: these are not used anymore.
  // OLD_INNAPROPRIATE = "inappropriate",
  // OLD_UNDESIRABLE = "undesirable",

  Spam = "spam",
  ScamOrUntrue = "scam-or-untrue", // = "Scam or untrue information"
  InappropriateCaption = "inappropriate-caption",
  JustNotForMe = "just-not-for-me",
  NudityOrSexual = "nudity-or-sexual",
  ViolentOrDangerous = "violent-or-dangerous",
  HateSpeechOrSymbols = "hate-speech-or-symbols",
  SuicideOrSelfHarm = "suicide-or-self-harm",
  Other = "other" // = "Something else"
}

export const REPORT_REASONS = {
  [PostReportReason.Spam]: "Spam",
  [PostReportReason.ScamOrUntrue]: "Scam or untrue information",
  [PostReportReason.InappropriateCaption]: "Inappropriate caption",
  [PostReportReason.JustNotForMe]: "Just not for me",
  [PostReportReason.NudityOrSexual]: "Nudity or sexual",
  [PostReportReason.ViolentOrDangerous]: "Violent or dangerous",
  [PostReportReason.HateSpeechOrSymbols]: "Hate speech or symbols",
  [PostReportReason.SuicideOrSelfHarm]: "Suicide or self-harm",
  [PostReportReason.Other]: "Something else",
} as const;

/**
 * report a post for moderation.
 * @returns a report id
 */
export const postModerationReportsPost = async (placement: "feed", reason: PostReportReason, postId: string, comment: string): Promise<string> => {
  const response = await fetch(`https://mobile-l7.bereal.com/api/moderation/reports/post`, {
    method: "POST",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      placement,
      reason,
      postId,
      comment
    })
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return postModerationReportsPost(placement, reason, postId, comment);
  }

  if (response.status !== 201) {
    throw new BeRealError("Failed to report the post");
  }

  const json = await response.json() as {
    reportId: string
  };

  return json.reportId;
};
