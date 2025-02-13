import { fetch } from "@tauri-apps/plugin-http";
import auth from "~/stores/auth"
import { BEREAL_DEFAULT_HEADERS } from "~/api/constants";
import type { ApiMedia } from "~/api/types/media";
import type { CommentPost } from "../content/posts/comment";

export interface Post {
  id: string
  momentId: string
  primary: ApiMedia & {
    mediaType: string
    mimeType: string
  }
  secondary: ApiMedia & {
    mediaType: string
    mimeType: string
  }

  caption?: string

  location?: {
    latitude: number
    longitude: number
  }

  realMojis: Array<{
    id: string
    user?: {
      id: string
      username: string
      profilePicture: ApiMedia | null
      type: "USER"
    }
    media: ApiMedia
    emoji: string
    type: "happy" | "up" | "heartEyes" | "surprised" | "laughing"
    isInstant: boolean
    postedAt: string
  }>

  music?: {
    isrc: string
    track: string
    artist: string
    /** URL of the artwork. */
    artwork: string
    /**
     * .m4a audio preview URL, only for Apple Music.
     */
    preview?: string
    /**
     * URL to open the music on their respective store (Apple Music, Spotify)
     */
    openUrl: string
    visibility: "public"
    provider: "apple" | "spotify"
    providerId: string
    audioType: "track"
  },

  comments: Array<CommentPost>

  tags: Array<{
    user: {
      id: string
      username: string
      profilePicture: ApiMedia | null
      fullname: string
      type: "USER"
    }
    userId: string
    replaceText: string
    searchText: string
    endIndex: number
    isUntagged: boolean
    type: "tag"
  }>

  retakeCounter: number
  /** 0 : if (!self.isLate) */
  lateInSeconds: number
  isLate: boolean
  isMain: boolean
  isFirst: boolean
  isResurrected: boolean
  visibility: ("friends" | "friends-of-friends")[]
  postedAt: string
  takenAt: string
  creationDate: string
  /** @deprecated use `creationDate` instead */
  createdAt: string
  updatedAt: string
  postType: "default" | "bts"

  /** only available if it's a post from us */
  origin?: "own" | "repost"

  parentPostId?: string
  parentPostUserId?: string
  parentPostUsername?: string

  btsMedia?: ApiMedia & {
    mediaType: "video"
    mimeType: "video/mp4"
  }

  screenshots?: Array<{
    id: string
    postId: string
    snappedAt: string
    user: {
      id: string
      username: string
      profilePicture: ApiMedia | null
    }
  }>

  unblurCount: number
}

export interface PostsOverview {
  user: {
    id: string
    username: string
    profilePicture: ApiMedia | null
    type: "USER"
    countryCode?: string
  }

  momentId: string
  region: string
  contentMappingEnabled: boolean

  posts: Array<Post>

  moment?: {
    id: string
    region: string
  }
}

export interface GetFeedsFriends {
  /** `null` if user has no posts for the on going moment. */
  userPosts: PostsOverview | null
  friendsPosts: Array<PostsOverview>

  remainingPosts: number
  maxPostsPerMoment: number
  eventProtoBytes: unknown[]
}

export const getFeedsFriends = async (): Promise<GetFeedsFriends> => {
  if (auth.isDemo()) {
    const { DEMO_FEEDS_FRIENDS } = await import("~/api/demo/feeds/friends");
    return DEMO_FEEDS_FRIENDS;
  }

  const response = await fetch("https://mobile-l7.bereal.com/api/feeds/friends-v1", {
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`
    }
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return getFeedsFriends();
  }

  return response.json();
}
