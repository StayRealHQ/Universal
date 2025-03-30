import { createEffect, createSignal, Show, type Component } from "solid-js";
import { reverseGeocoding, type ReverseGeocoding } from "~/api/requests/geocoding/reverse";

const Location: Component<{
  latitude: number
  longitude: number
}> = (props) => {
  const [geocoding, setGeocoding] = createSignal<ReverseGeocoding | null>(null);

  createEffect(async () => {
    const geocoding = await reverseGeocoding(props.latitude, props.longitude);
    console.log("[Location] geocoding:", geocoding);
    setGeocoding(geocoding);
  })

  return (
    <Show when={geocoding()} fallback={
      "..."
    }>
      {geocoding => (
        `${geocoding().address.town || geocoding().address.village || geocoding().address.city || geocoding().address.municipality}, ${geocoding().address.country}`
      )}
    </Show>
  )
};

export default Location;
