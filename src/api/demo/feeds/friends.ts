import type { GetFeedsFriends } from "~/api/requests/feeds/friends";
import { DEMO_RELATIONSHIPS_FRIENDS_LIST } from "~/api/demo/relationships/friends/list";

export const DEMO_FEEDS_FRIENDS: GetFeedsFriends = {
  eventProtoBytes: [],
  maxPostsPerMoment: 1,
  friendsPosts: [
    {
      contentMappingEnabled: false,
      momentId: "moment-123456",
      region: "europe-west",
      user: {
        countryCode: "FR",
        id: DEMO_RELATIONSHIPS_FRIENDS_LIST[0].id,
        profilePicture: null,
        type: "USER",
        username: DEMO_RELATIONSHIPS_FRIENDS_LIST[0].username
      },
      posts: [{
        comments: [],
        creationDate: new Date().toISOString(),
        id: DEMO_RELATIONSHIPS_FRIENDS_LIST[0].id + "-post-123456",
        isFirst: true,
        isLate: false,
        isMain: true,
        isResurrected: false,
        lateInSeconds: 0,
        postedAt: new Date().toISOString(),
        momentId: "moment-123456",
        postType: "default",
        primary: {
          // Taken from Vexcited's profile.
          url: "https://cdn-us1.bereal.network/Photos/QCP7u3Ado8Q1GIvAw4bXfNKggSA2/post/-ygM_srX5dWuiOaj.webp",
          height: 2000,
          width: 1500,
          mimeType: "image/webp",
          mediaType: "image"
        },
        secondary: {
          // Taken from Vexcited's profile.
          url: "https://cdn-us1.bereal.network/Photos/QCP7u3Ado8Q1GIvAw4bXfNKggSA2/post/UMzdNNw0A3HT8HSl.webp",
          height: 2000,
          width: 1500,
          mimeType: "image/webp",
          mediaType: "image"
        },
        realMojis: [],
        retakeCounter: 0,
        tags: [],
        takenAt: new Date().toISOString(),
        unblurCount: 0,
        updatedAt: new Date().toISOString(),
        visibility: ["friends"],
        createdAt: new Date().toISOString()
      }]
    }
  ],
  remainingPosts: 0,
  userPosts: null
};
