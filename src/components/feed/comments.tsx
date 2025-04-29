import { Component, For, Show, createSignal } from "solid-js";
import Drawer from "@corvu/drawer";

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
  comments: Comment[];
};

const PostComments: Component<PostCommentsProps> = (props) => {
  const [drawerOpen, setDrawerOpen] = createSignal(false);

  return (
    <>
      <div
        class="cursor-pointer"
        onClick={() => {
          setDrawerOpen(true);
        }}
        aria-label={`View all ${props.comments.length} comments`}
      >
        <For each={props.comments.slice(-2)}>
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
              <div class="max-h-140 overflow-y-auto pb-8 pt-4 flex flex-col gap-6">
                <For each={props.comments}>
                  {(comment) => {
                    const posted = new Date(comment.postedAt);
                    const fallbackLetter = comment.user.username[0]?.toUpperCase() || "?";
                    const profileUrl = `/user/${comment.user.id}`;

                    return (
                      <div class="flex items-start gap-3 text-white">
                        <a href={profileUrl}>
                          <Show when={comment.user.profilePicture?.url} fallback={
                            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm self-center">
                              {fallbackLetter}
                            </div>
                          }>
                            <img
                              src={comment.user.profilePicture!.url}
                              alt={comment.user.username}
                              class="w-10 h-10 rounded-full border border-white/20 self-center"
                            />
                          </Show>
                        </a>
                        <div class="flex flex-col">
                            <a href={profileUrl} class="text-sm font-500 w-fit">
                            {comment.user.username}{" "} {/*TODO: show fullname instead of username like original app*/}
                            <span class="text-white/50 font-normal text-xs">
                              {(() => {
                              const now = new Date();
                              const diff = now.getTime() - posted.getTime();
                              const seconds = Math.floor(diff / 1000);
                              const minutes = Math.floor(seconds / 60);
                              const hours = Math.floor(minutes / 60);

                              if (seconds < 60) {
                                return `${seconds} seconds ago`;
                              } else if (minutes < 60) {
                                return `${minutes} minutes ago`;
                              } else if (hours < 1) {
                                return `1 hour ago`;
                              } else if (now.toDateString() === posted.toDateString()) {
                                return `Today at ${posted.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                })}`;
                              } else if (
                                new Date(now.getTime() - 86400000).toDateString() ===
                                posted.toDateString()
                              ) {
                                return `Yesterday at ${posted.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                })}`;
                              } else {
                                return posted.toLocaleString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                month: "short",
                                day: "numeric",
                                });
                              }
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
            </Drawer.Content>
          </Drawer.Portal>
        )}
      </Drawer>
    </>
  );
};

export default PostComments;
