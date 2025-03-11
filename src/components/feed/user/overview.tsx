import { createEffect, createSignal, For, type Component, Show } from "solid-js";
import type { Post, PostsOverview } from "~/api/requests/feeds/friends";
import PostRealMojis from "~/components/feed/realmojis";
// import { useNavigate } from "@solidjs/router";
import MdiPlus from '~icons/mdi/plus'
import createEmblaCarousel from 'embla-carousel-solid'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import type { EmblaCarouselType, EmblaEventType } from "embla-carousel"
import { numberWithinRange } from "~/utils/number-within";
import PostSmallComments from "./post-small-comments";
import MdiFullscreen from '~icons/mdi/fullscreen'

const FeedUserOverview: Component<{
  overview: PostsOverview,
}> = (props) => {
  const [emblaRef, emblaApi] = createEmblaCarousel(
    () => ({
      skipSnaps: true,
      containScroll: false,
      startIndex: props.overview.posts.length - 1,
      slides: ".slide"
    }),
    () => [WheelGesturesPlugin()]
  );

  // const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = createSignal(props.overview.posts.length - 1);
  const activePost = (): Post | undefined  => props.overview.posts[activeIndex()];

  let tweenNodes: HTMLElement[] = [];
  const setTweenNodes = (api: EmblaCarouselType): void => {
    tweenNodes = api.slideNodes();
  };

  const tweenScale = (api: EmblaCarouselType, eventName?: EmblaEventType) => {
    const engine = api.internalEngine()
    const scrollProgress = api.scrollProgress()
    const slidesInView = api.slidesInView()
    const isScrollEvent = eventName === 'scroll'

    api.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress
      const slidesInSnap = engine.slideRegistry[snapIndex]

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return

        const tweenValue = 1 - Math.abs(diffToTarget * .2)
        const percentage = numberWithinRange(tweenValue, .85, 1).toString()
        const tweenNode = tweenNodes[slideIndex];
        tweenNode.style.transform = `scale(${percentage})`
        tweenNode.style.opacity = percentage
      })
    })
  };

  const setActiveNode = (api: EmblaCarouselType): void => {
    setActiveIndex(api.selectedScrollSnap());
  }

  createEffect(() => {
    const api = emblaApi()
    if (!api) return;

    setTweenNodes(api);
    tweenScale(api);

    api
      .on('reInit', setTweenNodes)
      .on('reInit', tweenScale)
      .on('scroll', tweenScale)
      .on('slideFocus', tweenScale)
      .on('select', setActiveNode)
  })

  return (
    <article role="article">
      <div class="overflow-hidden" ref={emblaRef}>
        <div class="flex py-5">
          <For each={props.overview.posts}>
            {(post, index) => (
              <div class="slide flex-[0_0_auto] min-w-0 max-w-full relative cursor-pointer mr-1"
                onClick={() => {
                  const api = emblaApi();
                  if (!api) return;

                  if (api.selectedScrollSnap() === index()) {
                    console.log("TODO: open post modal");
                  }
                  else {
                    api.scrollTo(index());
                  }
                }}
              >
                <img
                  class="h-11 w-auto absolute top-1 left-1 z-10 rounded-md border border-black shadow-lg"
                  src={post.secondary.url}
                  alt="Secondary image"
                />
                <img
                  class="rounded-lg h-140px"
                  src={post.primary.url}
                  alt="Primary image"
                />

                <Show when={post.screenshots}>
                  <button class="bg-white absolute -top-2 -right-2 rounded-md flex pl-.5 pr-1.5 gap-.5 items-center justify-center">
                    <MdiFullscreen class="text-black" />

                    <p class="font-600 text-xs text-black">
                      {post.screenshots?.length}
                    </p>
                  </button>
                </Show>

                <div class="absolute flex items-center justify-center z-20 -bottom-4 inset-x-0">
                  <PostRealMojis size={1.8} post={post} />
                  <PostSmallComments post={post} />
                </div>
              </div>
            )}
          </For>

          <a href="/upload"
            class="scale-80 flex-[0_0_auto] min-w-0 max-w-full rounded-lg h-140px border-2 border-white/75 flex items-center justify-center w-100px text-center"
            aria-label="Make a new moment"
          >
            <MdiPlus class="text-3xl" />
          </a>
        </div>
      </div>

      <Show when={activePost()}>
        {post => (
          <>
            <p class="text-sm text-center w-fit mx-auto">
              {post().caption}
            </p>
            <p class="text-sm text-center text-white/50">
              <time>
                {new Date(post().postedAt).toLocaleString()}
              </time>
            </p>
          </>
        )}
      </Show>
    </article>
  );
};

export default FeedUserOverview;
