import { type Component, createEffect, createSignal, For, on, onCleanup, Show } from "solid-js";
import { content_posts_repost } from "~/api/requests/content/posts/repost";
import { Post } from "~/api/requests/feeds/friends";
import PostRealMojis from "~/components/feed/realmojis";
import feed from "~/stores/feed";
import me from "~/stores/me";
import SolarSmileCircleBold from '~icons/solar/smile-circle-bold'
import ReactionBar from "../ReactionBar";
import { Gesture } from "@use-gesture/vanilla";
import toast from "solid-toast";
import MingcuteEmojiFill from '~icons/mingcute/emoji-fill'

const FeedFriendsPost: Component<{
  post: Post

  /**
   * User ID of the post owner.
   */
  postUserId: string
}> = (props) => {
  const [useVideo, setVideo] = createSignal<HTMLVideoElement>();
  const [useImage, setImage] = createSignal<HTMLImageElement>();

  const [isReversed, setIsReversed] = createSignal(false);
  const [isFocusing, setIsFocusing] = createSignal(false);
  const [isReacting, setIsReacting] = createSignal(false);

  const primaryURL = () => isReversed() ? props.post.secondary.url : props.post.primary.url;
  const secondaryURL = () => isReversed() ? props.post.primary.url : props.post.secondary.url;

  // Show up to 2 comments as a sample.
  const commentsSample = () => props.post.comments.slice(0, 2);

  // On mobile, when having pointer down and scrolling
  // doesn't trigger `pointerup`, but `pointercancel` instead.
  const unfocusEvents = ["pointerup", "pointercancel", "pointermove"];

  // Timer to wait before finally focusing the image.
  let timer: ReturnType<typeof setTimeout> | undefined;

  // Movement delta to determine if the user moved enough to unfocus.
  let delta = 0;

  // We should only unfocus when the user moves the pointer enough
  // since subtle movements should not unfocus the image on mobile.
  const shouldSkipUnfocusAttempt = (event: Event): boolean => {
    // `pointerup` and `pointercancel` should always unfocus.
    if (event.type !== "pointermove") return false;

    delta += Math.abs((event as PointerEvent).movementX) + Math.abs((event as PointerEvent).movementY);
    if (delta < 10) return true;
    return false;
  }

  /**
   * When we unfocus the image, we should show again
   * the elements around the primary image.
   *
   * Concerning BTS videos, we should hide the video
   * and reset it to the beginning.
   */
  const handleUnfocus = (event: Event): void => {
    if (shouldSkipUnfocusAttempt(event)) return;

    if (timer) clearTimeout(timer);
    setIsFocusing(false);

    const video = useVideo();
    if (video) { // hide, pause and reset the video
      video.classList.add("hidden");
      video.pause();
      video.currentTime = 0;
    }

    unfocusEvents.forEach(name => document.removeEventListener(name, handleUnfocus));
  };

  /**
   * What happens when the user focuses (long presses) on the image.
   *
   * We should wait for a certain amount of time before hiding
   * the elements around the primary image.
   *
   * Concerning BTS videos, we should show the video and play it.
   */
  const handleFocus = (event: PointerEvent): void => {
    // We ignore right-clicking.
    if (event.pointerType === "mouse" && event.button !== 0) return;

    // If we're currently reacting, clicking on the focused image
    // should remove the reaction bar.
    if (isReacting()) {
      setIsReacting(false);
      return;
    }

    if (timer) clearTimeout(timer);
    delta = 0;

    unfocusEvents.forEach(name => document.addEventListener(name, handleUnfocus));

    timer = setTimeout(() => {
      setIsFocusing(true);

      const video = useVideo();
      if (video) {
        video.classList.remove("hidden");
        video.play();
      }
    }, 350);
  };

  createEffect(on(useImage, (image) => {
    if (!image) return;


    let scale = 1;
    let transformX = 0;
    let transformY = 0;
    const update = () =>
      image.style.transform = `translate(${transformX}px, ${transformY}px) scale(${scale})`;

    const gesture = new Gesture(image, {
      onDrag: ({ delta: [dx, dy], pinching }) => {
        if (!pinching) return;

        transformX += dx;
        transformY += dy;
        update();
      },
      onPinch: ({ first, origin: [ox, oy], movement: [ms], offset: [s], memo }) => {
        if (first) {
          const { width, height, x: boundX, y: boundY } = image.getBoundingClientRect();
          const tx = ox - (boundX + width / 2)
          const ty = oy - (boundY + height / 2)
          memo = [transformX, transformY, tx, ty]
        }

        transformX = memo[0] - (ms - 1) * memo[2];
        transformY = memo[1] - (ms - 1) * memo[3];
        scale = s;

        if (!isFocusing()) setIsFocusing(true);
        update();

        return memo;
      },
      onPinchEnd: () => {
        scale = 1;
        transformY = 0;
        transformX = 0;
        image.style.transform = "";
        setIsFocusing(false);
      }
    }, {
      eventOptions: { passive: false },
      drag: { from: () => [transformX, transformY] },
      pinch: { from: [1, 0], threshold: 0.1 }
    });

    onCleanup(() => gesture.destroy());
  }))

  const [isReposting, setIsReposting] = createSignal(false);
  const handleRepost = async () => {
    setIsReposting(true);

    try {
      // TODO: add "friends of friends" support and modal to ask which one to use
      await content_posts_repost(props.post.id, props.postUserId, "friends");
      await feed.refetch();
    }
    catch (error) {
      toast.error("Failed to repost, please retry.");
    }
    finally {
      setIsReposting(false);
    }
  };

  const isUserTagged = () => props.post.tags.some(tag => tag.userId === me.get()?.id);
  const isCurrentlyReposted = () => (feed.get()?.userPosts?.posts ?? []).some(post =>
    post.origin === "repost" && post.parentPostId === props.post.id
  );

  return (
    <div class="z-20 relative mx-auto w-fit">
      <img
        class="z-30 h-40 w-auto absolute top-4 right-4 rounded-xl inline-block border border-white/25 shadow-xl transition-opacity"
        onClick={() => setIsReversed(prev => !prev)}
        alt="Secondary image"
        src={secondaryURL()}
        classList={{
          "opacity-0 pointer-events-none": isFocusing()
        }}
      />

      <img ref={setImage}
        class="max-h-80vh"
        alt="Primary image"
        src={primaryURL()}
        onPointerDown={handleFocus}
      />

      <Show when={props.post.postType === "bts"}>
        <video ref={setVideo}
          class="hidden absolute inset-0 max-h-80vh"
          src={props.post.btsMedia!.url}
          controls={false}
          autoplay={false}
          muted={false}
          playsinline
          onEnded={handleUnfocus}
        ></video>

        <p class="z-25 absolute top-4 left-4 bg-black/20 text-white px-3 py-.5 transition-opacity rounded-xl backdrop-blur font-600"
          classList={{
            "opacity-0 pointer-events-none": isFocusing()
          }}
        >
          BTS
        </p>
      </Show>

      {/* dimmed background overlay */}
      <Show when={!isFocusing()}>
        <div class="z-25 absolute inset-x-0 h-300px bottom-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      </Show>

      {/* small realmojis in the bottom left */}
      <div class="w-fit">
        <div class="absolute z-30 bottom-4 left-4 transition-opacity"
          classList={{
            "opacity-0 pointer-events-none": isFocusing() || isReacting()
          }}
        >
          <PostRealMojis post={props.post} size={2} />
        </div>
      </div>

      <div class="w-fit">
        <div class="absolute z-30 bottom-2 right-4 transition-opacity"
          classList={{
            "opacity-0 pointer-events-none": isFocusing() || isReacting()
          }}
        >
          <button type="button"
            onClick={() => setIsReacting(true)}
          >
            <MingcuteEmojiFill class="text-white text-3xl" />
          </button>
        </div>
      </div>

      {/* Reaction using realmojis feature. */}
      <div class="absolute z-30 left-4 right-4 transition-all"
        classList={{
          "opacity-0 pointer-events-none -bottom-6": !isReacting(),
          "bottom-4": isReacting()
        }}
      >
        <ReactionBar post={props.post} postUserId={props.postUserId}
          onReact={() => {
            setIsReacting(false);
            feed.refetch();
          }}
        />
      </div>

      <div class="z-30 absolute left-4 bottom-16 overflow-hidden right-8 transition-all"
        classList={{
          "opacity-0 pointer-events-none": isFocusing() || isReacting()
        }}
      >
        <For each={commentsSample()}>
          {comment => (
            <div class="flex items-center gap-1.5">
              <p class="shrink-0 font-500">{comment.user.username}</p>
              <p class="truncate">{comment.content}</p>
            </div>
          )}
        </For>
      </div>

      {/*
        * Repost feature
        * --------------
        * We should show it only when the current user is tagged in the post
        * and the post is not already reposted by the current user.
        */}
      <Show when={isUserTagged() && !isCurrentlyReposted()}>
        <div class="absolute z-30 bottom-4.5 inset-x-0 w-fit mx-auto">
          <button
            type="button"
            class="bg-white text-black uppercase font-bold px-4 py-.5 rounded-full shadow-lg disabled:opacity-50"
            disabled={isReposting()}
            onClick={handleRepost}
          >
            Repost
          </button>
        </div>
      </Show>
    </div>
  );
};

export default FeedFriendsPost;
