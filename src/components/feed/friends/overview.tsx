import { batch, type Component, createMemo, createSignal, For, Show } from "solid-js";
import type { PostsOverview } from "~/api/requests/feeds/friends";
import MdiRepost from '~icons/mdi/repost';
import MdiCommentOutline from '~icons/mdi/comment-outline'
import FeedFriendsPost from "./post";
import MingcuteMore4Fill from '~icons/mingcute/more-4-fill'
import Location from "~/components/location";
import { Duration } from "luxon";
import MingcuteLocationFill from '~icons/mingcute/location-fill'
import MingcuteTimeFill from '~icons/mingcute/time-fill'
import { open } from "@tauri-apps/plugin-shell"
import MdiSend from '~icons/mdi/send'
import me from "~/stores/me";
import { content_posts_comment } from "~/api/requests/content/posts/comment";
import feed from "~/stores/feed";
import ProfilePicture from "~/components/profile-picture";
import Drawer from "@corvu/drawer";
import { confirm } from "@tauri-apps/plugin-dialog";
import { postModerationBlockUsers } from "~/api/requests/moderation/block-users";
import MdiLaunch from '~icons/mdi/launch'
import MdiChevronRight from '~icons/mdi/chevron-right'
import { postModerationReportsPost, PostReportReason, REPORT_REASONS } from "~/api/requests/moderation/reports/post";

const FeedFriendsOverview: Component<{
  overview: PostsOverview
}> = (props) => {
  const post = () => props.overview.posts[0];
  const postDate = () => new Date(post().postedAt);

  const lateDuration = createMemo(() => {
    if (post().lateInSeconds > 0) {
      const duration = Duration.fromObject({ seconds: post().lateInSeconds });
      return duration.rescale().toHuman({ unitDisplay: "short" });
    }
  });

  const [comment, setComment] = createSignal("");
  const handlePostComment = async (event: SubmitEvent) => {
    event.preventDefault();

    const content = comment().trim();
    if (!content) return;

    await content_posts_comment(post().id, props.overview.user.id, content);
    await feed.refetch();
  };

  const [isActionsDrawerOpened, setActionsDrawerOpen] = createSignal(false);
  const [isReportDrawerOpened, setReportDrawerOpen] = createSignal(false);
  const [reportReason, setReportReason] = createSignal<PostReportReason>();
  const [reportComments, setReportComments] = createSignal("");
  const [reportLoading, setReportLoading] = createSignal(false);

  const handlePostReport = async () => {
    if (!reportReason() || !reportComments()) return;
    if (reportComments().length < 10) return;

    setReportLoading(true);

    try {
      await postModerationReportsPost("feed", reportReason()!, post().id, reportComments());
    }
    finally {
      batch(() => {
        setReportDrawerOpen(false);
        setReportLoading(false);
        setReportComments("");
        setReportReason(void 0);
      });
    }
  }

  return (
    <>
      <Drawer
        trapFocus={false}
        onOutsideFocus={e => e.preventDefault()}
        open={isActionsDrawerOpened()}
        onOpenChange={setActionsDrawerOpen}
        breakPoints={[0.75]}
      >
        {(drawer) => (
          <Drawer.Portal>
            <Drawer.Overlay
              class="fixed inset-0 z-50 corvu-transitioning:transition-colors corvu-transitioning:duration-500 corvu-transitioning:ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                'background-color': `rgb(0 0 0 / ${
                  0.5 * drawer.openPercentage
                })`,
              }}
            />
            <Drawer.Content class="corvu-transitioning:transition-transform corvu-transitioning:duration-500 corvu-transitioning:ease-[cubic-bezier(0.32,0.72,0,1)] fixed inset-x-0 bottom-0 z-50 flex h-full max-h-70 flex-col rounded-t-xl bg-[#141414] pt-3 px-4 after:absolute after:inset-x-0 after:top-[calc(100%-1px)] after:h-1/2 after:bg-inherit md:select-none">
              <div class="h-1 w-10 self-center rounded-full bg-white/40" />

              <div class="flex flex-col gap-2 mt-6">
                <div class="flex gap-2 mb-4">
                  <button type="button" class="w-full h-16 relative rounded-lg transition-opacity active:opacity-50"
                    onClick={() => open(post().primary.url)}
                    style={{
                      background: `url(${post().primary.url}) center center / cover no-repeat`
                    }}
                  >
                    <div class="absolute inset-1 rounded-md bg-black/40 flex items-center justify-center hover:opacity-50 transition-opacity">
                      <MdiLaunch class="text-lg" />
                    </div>
                  </button>
                  <button type="button" class="w-full h-16 relative rounded-lg transition-opacity active:opacity-50"
                    onClick={() => open(post().secondary.url)}
                    style={{
                      background: `url(${post().secondary.url}) center center / cover no-repeat`
                    }}
                  >
                    <div class="absolute inset-1 rounded-md bg-black/40 flex items-center justify-center hover:opacity-50 transition-opacity">
                      <MdiLaunch class="text-lg" />
                    </div>
                  </button>
                </div>

                <button type="button" class="w-full rounded-lg bg-white/5 text-red/80 hover:text-white px-4 py-3 text-lg font-medium transition-all duration-100 hover:bg-white/10 active:opacity-50"
                  onClick={() => {
                    // We wait a bit to make it feel more natural.
                    setTimeout(() => {
                      batch(() => {
                        setActionsDrawerOpen(false);
                        setReportDrawerOpen(true);
                      })
                    }, 75);
                  }}
                >
                  Report this post
                </button>

                <button type="button" class="w-full rounded-lg bg-white/5 text-red/80 hover:text-white px-4 py-3 text-lg font-medium transition-all duration-100 hover:bg-white/10 active:opacity-50"
                  onClick={async () => {
                    // 0. make sure the user wants to block the user.
                    const confirmation = await confirm(`${props.overview.user.username} will no longer be able to see your public posts. ${props.overview.user.username} will be removed from your friends.`, {
                      title: `Block ${props.overview.user.username}?`,
                      okLabel: "Block",
                      cancelLabel: "Cancel",
                      kind: "warning"
                    });

                    if (!confirmation) return;

                    // 1. block the user.
                    await postModerationBlockUsers(props.overview.user.id);

                    // 2. close the drawer.
                    setActionsDrawerOpen(false);

                    // 3. refresh the feed.
                    await feed.refetch();
                  }}
                >
                  Block this user
                </button>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        )}
      </Drawer>

      <Drawer
        transitionResize
        trapFocus={false}
        onOutsideFocus={e => e.preventDefault()}
        open={isReportDrawerOpened()}
        breakPoints={[0.75]}
        onOpenChange={(open) => {
          setReportDrawerOpen(open);
          setTimeout(() => {
            if (!open) {
              batch(() => {
                setReportReason(void 0);
                setReportComments("");
              })
            }
          }, 1250);
        }}
      >
        {(drawer) => (
          <Drawer.Portal>
            <Drawer.Overlay
              class="fixed inset-0 z-50 corvu-transitioning:transition-colors corvu-transitioning:duration-500 corvu-transitioning:ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                'background-color': `rgb(0 0 0 / ${
                  0.5 * drawer.openPercentage
                })`,
              }}
            />
            <Drawer.Content class="corvu-transitioning:transition-[transform,height] corvu-transitioning:duration-500 corvu-transitioning:ease-[cubic-bezier(0.32,0.72,0,1)] fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-lg bg-[#141414] pt-3 px-4 after:absolute after:inset-x-0 after:top-[calc(100%-1px)] after:h-1/2 after:bg-inherit md:select-none">
              <div class="h-1 w-10 self-center rounded-full bg-white/40" />

              <Drawer.Label class="mt-4 text-center text-xl font-bold">
                Report a post
              </Drawer.Label>
              <Drawer.Description class="mt-1 text-center text-white/75">
                Your report is confidential.
              </Drawer.Description>

              <Show when={reportReason()} fallback={
                <div class="flex flex-col gap-2 mt-3 grow overflow-y-auto pb-4">
                  <For each={Object.entries(REPORT_REASONS)}>
                    {([reason, label]) => (
                      <button type="button" class="w-full flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 text-lg font-medium transition-all duration-100 hover:bg-white/10 active:opacity-50"
                        onClick={() => {
                          setReportReason(reason as PostReportReason);
                        }}
                      >
                        {label} <MdiChevronRight class="text-lg" />
                      </button>
                    )}
                  </For>
                </div>
              }>
                <div class="mt-3 h-full overflow-y-auto pb-4">
                  <p class="text-sm text-white/50 mb-2">If you or someone you know is in immediate danger, contact local law enforcement or your local emergency services immediately.</p>

                  <textarea placeholder="Help us understand, tell us more..." value={reportComments()} onInput={event => setReportComments(event.currentTarget.value)}
                    class="outline-none w-full bg-white/10 text-white p-2 rounded-lg mt-3 h-28"
                  />

                  <p class="text-white/50 text-sm mb-4">
                    Minimum of 10 characters required.
                  </p>

                  <button type="button" onClick={handlePostReport} class="w-full rounded-lg bg-white/5 hover:text-white px-4 py-3 text-lg font-medium transition-all duration-100 hover:bg-white/10 active:opacity-50 disabled:opacity-50"
                    disabled={reportLoading() || reportComments().length < 10}
                  >
                    Send
                  </button>
                </div>
              </Show>
            </Drawer.Content>
          </Drawer.Portal>
        )}
      </Drawer>

      <div>
        <div class="flex items-center gap-3 px-4 py-2.5 rounded-t-2xl">
          <ProfilePicture
            username={props.overview.user.username}
            media={props.overview.user.profilePicture}
            size={32}
            textSize={12}
          />

          <div class="flex-col w-full overflow-hidden">
            <div class="flex gap-4">
              <p class="font-600 w-fit">
                {props.overview.user.username}
              </p>
              <Show when={post().origin === "repost"}>
                <p class="w-fit text-white/80 flex items-center gap-1 bg-white/20 pl-2 pr-2.5 rounded-full text-xs">
                  <MdiRepost />{post().parentPostUsername}
                </p>
              </Show>
            </div>

            <div class="flex items-center gap-2 text-sm text-white/50">
              <div class="flex items-center gap-1 shrink-0">
                <MingcuteTimeFill />
                <p>{postDate().toLocaleTimeString(void 0, {
                  hour: "2-digit",
                  minute: "2-digit"
                })}</p>
              </div>

              <Show when={post().location}>
                {location => (
                  <button type="button"
                    onClick={() => open(`https://maps.google.com/?q=${location().latitude},${location().longitude}`)}
                    class="flex items-center gap-1 overflow-hidden"
                  >
                    <MingcuteLocationFill class="shrink-0" />
                    <p class="truncate">
                      <Location
                        latitude={location().latitude}
                        longitude={location().longitude}
                      />
                    </p>
                  </button>
                )}
              </Show>
            </div>
          </div>

          <button type="button"
            onClick={() => setActionsDrawerOpen(true)}
            class="ml-auto opacity-50"
          >
            <MingcuteMore4Fill class="text-xl" />
          </button>
        </div>

        <div class="relative overflow-hidden">
          <FeedFriendsPost
            post={props.overview.posts[0]}
            postUserId={props.overview.user.id}
          />
        </div>

        <div class="px-6 pt-4 mb-2">
          <p class="text-left">
            {post().caption}
          </p>

          <div class="text-sm font-300">
            <form onSubmit={handlePostComment} class="flex items-center gap-2 mt-2">
              <ProfilePicture
                username={me.get()!.username}
                media={me.get()?.profilePicture}
                size={24}
                textSize={8}
              />
              <input
                type="text"
                placeholder="Add a comment..."
                class="bg-transparent text-white outline-none w-full focus:bg-white/10 py-1 px-2 rounded-lg transition-colors"
                value={comment()}
                onInput={event => setComment(event.currentTarget.value)}
              />
              <button type="submit" class="bg-white/20 text-white py-1.5 px-2 rounded-lg disabled:bg-white/10 disabled:text-white/50 hover:bg-white/25 focus:bg-white/25 transition-colors"
                disabled={!comment().trim()}
              >
                <MdiSend class="text-xs" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedFriendsOverview;
