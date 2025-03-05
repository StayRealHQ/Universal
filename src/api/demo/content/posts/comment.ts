import type { CommentPost } from "~/api/requests/content/posts/comment";
import { DEMO_FEEDS_FRIENDS as feed } from "~/api/demo/feeds/friends";
import { DEMO_PERSON_ME } from "~/api/demo/person/me";

export const DEMO_CONTENT_POSTS_COMMENT = async (postId: string, postUserId: string, content: string): Promise<CommentPost> => {
  const overview = feed.friendsPosts?.find(p => p.posts.some(p => p.id === postId) && p.user.id === postUserId);
  if (!overview) throw new Error("overview not found");

  const post = overview.posts.find(p => p.id === postId);
  if (!post) throw new Error("post not found");

  const comment = {
    id: `${post.id}-comment-${post.comments.length + 1}`,
    user: {
      id: DEMO_PERSON_ME.id,
      username: DEMO_PERSON_ME.username,
      type: DEMO_PERSON_ME.type,
    },
    content,
    postedAt: new Date().toISOString(),
  } satisfies CommentPost;

  post.comments = [...post.comments, comment];
  return comment;
};
