import { createEffect, type Component } from "solid-js";
import { useNavigate } from "@solidjs/router";
import auth from "../stores/auth";

const SplashView: Component = () => {
  const navigate = useNavigate();

  createEffect(() => {
    // let's just wait for the auth store to finish loading...
    if (auth.store.loading) return;

    // redirect to the appropriate page based on the final auth state.
    if (auth.store.accessToken && auth.store.refreshToken)
      navigate("/feed/friends");
    else
      navigate("/login");
  });

  return (
    <div class="h-100dvh flex flex-col items-center justify-center">
      <h1 class="text-3xl font-bold">
        StayReal.
      </h1>
      <p class="pt-2 font-200 opacity-50">
        Let's get real.
      </p>
    </div>
  )
};

export default SplashView;
