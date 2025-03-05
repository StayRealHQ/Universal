import { createEffect, on, Show, type Component } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { createStore } from "solid-js/store";
import { v4 as uuidv4 } from "uuid";

import { vonage_request_code, VonageRequestCodeTokenIdentifier } from "~/api/requests/auth/vonage/request";
import { firebase_verify_custom_token } from "~/api/requests/auth/firebase/verify-custom-token";
import { vonage_verify_otp } from "~/api/requests/auth/vonage/verify";
import { grant_firebase } from "~/api/requests/auth/token";
import { BEREAL_ARKOSE_PUBLIC_KEY } from "~/api/constants";

import { createArkoseURL } from "~/components/arkose";
import auth from "~/stores/auth";
import { DEMO_ACCESS_TOKEN, DEMO_PHONE_NUMBER, DEMO_REFRESH_TOKEN } from "~/utils/demo";
import MdiChevronLeft from '~icons/mdi/chevron-left'
import { postVonageDataExchange } from "~/api/requests/auth/vonage/data-exchange";
import Otp from "~/components/otp";
import MdiLoading from '~icons/mdi/loading'
import { BeRealError } from "~/api/models/errors";
import { invoke } from "@tauri-apps/api/core";

const LoginView: Component = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams<{ arkoseToken: string }>()

  const [state, setState] = createStore({
    step: "phone" as ("phone" | "otp"),
    deviceID: localStorage.getItem("login__deviceID") || uuidv4(),
    error: null as string | null,
    loading: false,

    phoneNumber: localStorage.getItem("login__phoneNumber") || "",
    requestID: "",
    otp: "",
  })

  const runAuthentication = async (): Promise<void> => {
    if (!state.phoneNumber) return;

    // Make sure there's no whitespace in the phone number.
    const phoneNumber = state.phoneNumber.replace(/ /g, "");

    try {
      setState("loading", true);

      if (state.step === "phone") {
        let requestID: string;

        if (phoneNumber === DEMO_PHONE_NUMBER) {
          requestID = "demo";
        }
        else {
          if (!params.arkoseToken) {
            const dataExchange = await postVonageDataExchange({
              deviceID: state.deviceID,
              phoneNumber
            });

            // Save the state in `localStorage` to remember it
            // when we come back from the Arkose challenge.
            localStorage.setItem("login__phoneNumber", phoneNumber);
            localStorage.setItem("login__deviceID", state.deviceID);

            const url = createArkoseURL(BEREAL_ARKOSE_PUBLIC_KEY, dataExchange, state.deviceID);
            // For some odd reason, we can't use `location.href = url` here
            // so we're doing it through a Tauri command instead.
            return invoke("navigate", { url });
          }

          // We can safely remove the temporary state from localStorage.
          localStorage.removeItem("login__phoneNumber");
          localStorage.removeItem("login__deviceID");

          const token = params.arkoseToken;
          // One time use, we don't need it anymore.
          setParams({ arkoseToken: void 0 });

          requestID = await vonage_request_code({
            deviceID: state.deviceID,
            phoneNumber,
            tokens: [{
              identifier: VonageRequestCodeTokenIdentifier.ARKOSE,
              token,
            }]
          });
        }

        setState({ step: "otp", requestID });
      }
      else if (state.step === "otp") {
        if (phoneNumber === DEMO_PHONE_NUMBER) {
          await auth.save({
            deviceId: state.deviceID,
            accessToken: DEMO_ACCESS_TOKEN,
            refreshToken: DEMO_REFRESH_TOKEN(0)
          });
        }
        else {
          // fun fact: this should match `grant_firebase`'s `access_token` value
          const token = await vonage_verify_otp({
            requestID: state.requestID,
            deviceID: state.deviceID,
            otp: state.otp.trim()
          });

          const idToken = await firebase_verify_custom_token(token);
          const tokens = await grant_firebase({
            deviceID: state.deviceID,
            idToken
          });

          await auth.save({
            deviceId: state.deviceID,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token
          });
        }

        navigate("/feed/friends");
      }
    }
    catch (error) {
      if (error instanceof BeRealError) {
        setState("error", error.message);
      }
      else {
        setState("error", "An error occurred while authenticating, please try again later.");
      }
    }
    finally {
      setState("loading", false);
    }
  };

  // If we're coming back from the Arkose challenge, we need to
  // re-run the authentication process.
  createEffect(on(() => params.arkoseToken, (token) => {
    if (token)
      runAuthentication();
  }));

  return (
    <main class="h-screen flex flex-col px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <header class="shrink-0 flex items-center relative w-full h-8 pt-6">
        <Show when={state.step === "otp"}>
          <button type="button"
            onClick={() => {
              setState({
                step: "phone",
                otp: "",
              });
            }}
          >
            <MdiChevronLeft class="text-xl" />
          </button>
        </Show>

        <div class="absolute inset-x-0 w-fit mx-auto text-2xl text-center text-white font-700" role="banner">
          StayReal.
        </div>
      </header>

      <h1 class="my-10 w-fit mx-auto text-center font-600">
        {state.step === "phone" ? "What's your phone number?" : "Check your number"}
      </h1>

      <form
        class="flex flex-col gap-4 h-full pb-6"
        onSubmit={(event) => {
          event.preventDefault();
          runAuthentication();
        }}
      >
        <Show when={state.step === "phone"}>
          <input
            class="w-full max-w-280px mx-auto rounded-2xl py-3 px-4 text-white bg-white/10 text-2xl font-600 tracking-wide outline-none placeholder:text-white/40 focus:(outline outline-white outline-offset-2)"
            type="tel"
            inputMode="tel"
            autocomplete="tel"
            value={state.phoneNumber}
            onInput={e => setState("phoneNumber", e.currentTarget.value)}
            placeholder="+33 6 12 34 56 78"
            required
          />

          <p class="mt-8 text-sm text-center px-4 text-white/75">
            By continuing, you agree that StayReal is not affiliated with BeReal and that you are using this service at your own risk.
          </p>

          <Show when={state.error}>
            <p class="mt-8 text-sm text-center px-4 text-red">
              {state.error}
            </p>
          </Show>

          <button type="submit" disabled={state.loading || !state.phoneNumber}
            class="text-black bg-white rounded-2xl w-full py-3 mt-auto focus:(outline outline-white outline-offset-2) disabled:opacity-30 transition-all"
          >
            <Show when={state.loading} fallback={"Send Verification Text"}>
              <div class="flex items-center justify-center">
                <MdiLoading class="text-black text-xl animate-spin animate-duration-750" />
              </div>
            </Show>
          </button>
        </Show>
        <Show when={state.step === "otp"}>
          <Otp
            submit={(code) => {
              setState("otp", code);
              runAuthentication();
            }}
          />

          <Show when={!state.loading} fallback={
            <div class="flex items-center justify-center mt-8">
              <MdiLoading class="text-white text-2xl animate-spin animate-duration-750" />
            </div>
          }>
            <Show when={state.phoneNumber !== DEMO_PHONE_NUMBER} fallback={
              <p class="mt-8 text-sm text-center px-4 text-white/75">
                You're authenticating on the demonstration account, your OTP code is 123456
              </p>
            }>
              <p class="mt-8 text-sm text-center px-4 text-white/75">
                Verification code sent to {state.phoneNumber}
              </p>
            </Show>
          </Show>
        </Show>

        <p class="text-white/40 text-xs text-center" aria-hidden="true"
          classList={{ "mt-auto": state.step === "otp" }}
        >
          device-id: {state.deviceID}
        </p>
      </form>
    </main>
  );
};

export default LoginView;
