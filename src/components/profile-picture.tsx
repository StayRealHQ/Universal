import { type Component, createSignal, Show } from "solid-js";
import type { ApiMedia } from "~/api/types/media";

const ProfilePicture: Component<{
  media: ApiMedia | null | undefined
  fullName?: string | undefined
  username: string
  size: number
  textSize?: number
}> = (props) => {
  const [isUnavailable, setUnavailable] = createSignal(false);
  const name = () => props.fullName || props.username;

  const style = () => ({
    width: `${props.size}px`,
    height: `${props.size}px`
  });

  return (
    <Show
      when={!isUnavailable() && props.media}
      fallback={
        <div
          class="shrink-0 rounded-full flex items-center justify-center"
          style={{...style(), "background-color": "var(--overlay-strong)"}}
        >
          <span class="font-500 uppercase leading-[0] translate-y-[2px]"
            style={{ "font-size": `${props.textSize ?? 24}px` }}
          >
            {name()[0]}
          </span>
        </div>
      }
    >
      {(media) => (
        <img
          class="shrink-0 rounded-full"
          src={media().url}
          alt={name()}
          onError={() => setUnavailable(true)}
          style={style()}
        />
      )}
    </Show>
  )
};

export default ProfilePicture;
