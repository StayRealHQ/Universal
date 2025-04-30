import { Component, For, Show, createSignal } from "solid-js";
import Drawer from "@corvu/drawer";
import { content_posts_comment } from "~/api/requests/content/posts/comment";
import feed from "~/stores/feed";
import me from "~/stores/me";
import MdiSend from '~icons/mdi/send'
import ProfilePicture from "~/components/profile-picture";

type Comment = {
  user: {
    id: string;
    username: string;
    profilePicture?: {
      url: string;
    };
  };
  content: string;
  postedAt: string;
};

type PostCommentsProps = {
  postUserId: string;
  postData:{
    comments: Comment[];
    id: string;
  }
};

const PostComments: Component<PostCommentsProps> = (props) => {
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const [comment, setComment] = createSignal("");

  const handlePostComment = async (event: SubmitEvent) => {
    event.preventDefault();

    const content = comment().trim();
    if (!content) return;

    try {
      await content_posts_comment(props.postData.id, props.postUserId, content);
      setComment(""); // Clear comment input
      await feed.refetch(); // Refresh post data
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };
  console.log(props);
  return (
    <>
      <div
        class="cursor-pointer"
        onClick={() => {
          setDrawerOpen(true);
        }}
        aria-label={`View all ${props.postData.comments.length} comments`}
      >
        <For each={props.postData.comments.slice(-2)}>
          {(comment) => (
            <div class="flex items-center gap-1.5">
              <p class="shrink-0 font-500">{comment.user.username}</p>
              <p class="truncate">{comment.content}</p>
            </div>
          )}
        </For>
      </div>

      <Drawer
        trapFocus={false}
        onOutsideFocus={(e) => e.preventDefault()}
        open={drawerOpen()}
        onOpenChange={setDrawerOpen}
        breakPoints={[0.75]}
      >
        {(drawer) => (
          <Drawer.Portal>
            <Drawer.Overlay
              class="fixed inset-0 z-50 corvu-transitioning:transition-colors corvu-transitioning:duration-500 corvu-transitioning:ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                "background-color": `rgb(0 0 0 / ${0.5 * drawer.openPercentage})`,
              }}
            />
            <Drawer.Content class="corvu-transitioning:transition-transform corvu-transitioning:duration-500 corvu-transitioning:ease-[cubic-bezier(0.32,0.72,0,1)] fixed inset-x-0 bottom-0 z-50 flex h-full max-h-140 flex-col rounded-t-xl bg-[#141414] pt-3 px-4 after:absolute after:inset-x-0 after:top-[calc(100%-1px)] after:h-1/2 after:bg-inherit md:select-none">
              <div class="h-1 w-10 self-center rounded-full bg-white/40" />
                <div class="max-h-140 overflow-y-auto pb-20 pt-4 flex flex-col gap-6">
                <For each={props.postData.comments}>
                  {(comment) => {
                  const posted = new Date(comment.postedAt);
                  const fallbackLetter = comment.user.username[0]?.toUpperCase() || "?";
                  const profileUrl = `/user/${comment.user.id}`;

                  return (
                    <div class="flex items-start gap-3 text-white">
                    <a href={profileUrl}>
                        <Show
                        when={comment.user.profilePicture?.url}
                        fallback={
                          <div class="min-w-[2.5rem] w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm self-center">
                          {fallbackLetter}
                          </div>
                        }
                        >
                        <img
                          src={comment.user.profilePicture!.url}
                          alt={comment.user.username}
                          class="min-w-[2.5rem] w-10 h-10 rounded-full border border-white/20 self-center"
                        />
                        </Show>
                    </a>
                    <div class="flex flex-col">
                      <a href={profileUrl} class="text-sm font-500 w-fit">
                      {comment.user.username}{" "}
                      <span class="text-white/50 font-normal text-xs">
                        {(() => {
                        const now = new Date();
                        const diff = now.getTime() - posted.getTime();
                        const seconds = Math.floor(diff / 1000);
                        const minutes = Math.floor(seconds / 60);
                        const hours = Math.floor(minutes / 60);

                        if (seconds < 60) return `${seconds} seconds ago`;
                        if (minutes < 60) return `${minutes} minutes ago`;
                        if (hours < 1) return `1 hour ago`;
                        if (now.toDateString() === posted.toDateString())
                          return `Today at ${posted.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          })}`;
                        if (
                          new Date(now.getTime() - 86400000).toDateString() ===
                          posted.toDateString()
                        )
                          return `Yesterday at ${posted.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          })}`;
                        return posted.toLocaleString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "numeric",
                        });
                        })()}
                      </span>
                      </a>
                      <p class="text-sm text-white/80 whitespace-pre-line">
                      {comment.content}
                      </p>
                    </div>
                    </div>
                  );
                  }}
                </For>
                </div>
                <div class="text-sm font-300 fixed bottom-0 left-0 right-0 bg-[#141414] pb-4 pt-2 z-50">
                <form onSubmit={handlePostComment} class="flex items-center gap-2 mt-2 px-4">
                  <ProfilePicture
                  username={me.get()!.username}
                  fullName={me.get()!.fullname}
                  media={me.get()?.profilePicture}
                  size={24}
                  textSize={8}
                  />
                  <input
                  type="text"
                  placeholder="Add a comment..."
                  class="bg-transparent text-white outline-none w-full focus:bg-white/10 py-1 px-2 rounded-lg transition-colors"
                  value={comment()}
                  onInput={(event) => setComment(event.currentTarget.value)}
                  />
                  <button
                  type="submit"
                  class="bg-white/20 text-white py-1.5 px-2 rounded-lg disabled:bg-white/10 disabled:text-white/50 hover:bg-white/25 focus:bg-white/25 transition-colors"
                  disabled={!comment().trim()}
                  >
                  <MdiSend class="text-xs" />
                  </button>
                </form>
                </div>
            </Drawer.Content>
          </Drawer.Portal>
        )}
      </Drawer>
    </>
  );
};

export default PostComments;
