/* @refresh reload */
import "@unocss/reset/tailwind.css";
import "virtual:uno.css";

import { lazy } from "solid-js";
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";

import SplashView from "~/views/splash";
import { Toaster } from "solid-toast";

// Initialize theme store
import "~/stores/theme";

const routes = [
  {
    path: "/",
    component: SplashView
  },
  {
    path: "/feed",
    component: lazy(() => import("~/layouts/feed")),
    children: [
      {
        path: "/friends",
        component: lazy(() => import("~/views/feed/friends"))
      },
      {
        path: "/friends-of-friends",
        component: lazy(() => import("~/views/feed/friends-of-friends"))
      },
    ]
  },
  {
    path: "/login",
    component: lazy(() => import("~/views/login"))
  },
  {
    path: "/create-profile",
    component: lazy(() => import("~/views/create-profile"))
  },
  {
    path: "/profile",
    component: lazy(() => import("~/views/profile"))
  },
  {
    path: "/user/:id",
    component: lazy(() => import("~/views/userProfile"))
  },
  {
    path: "/upload",
    component: lazy(() => import("~/views/upload"))
  },
  {
    path: "/uploadFromStorage",
    component: lazy(() => import("~/views/uploadFromStorage"))
  },
  {
    path: "/friends",
    component: lazy(() => import("~/layouts/friends")),
    children: [
      {
        path: "/connections",
        component: lazy(() => import("~/views/friends/connections"))
      },
      {
        path: "/requests",
        component: lazy(() => import("~/views/friends/requests"))
      },
    ]
  },
  {
    path: "/settings",
    component: lazy(() => import("~/views/settings"))
  },
  {
    path: "/settings/blocked-users",
    component: lazy(() => import("~/views/settings/blocked-users"))
  }
]

render(() => (
  <>
    <Toaster position="top-center"
      containerStyle={{
        "margin-top": "env(safe-area-inset-top)",
      }}
      toastOptions={{
        iconTheme: {
          primary: 'var(--text-primary)',
          secondary: 'var(--bg-primary)',
        },
        style: {
          color: "var(--text-primary)",
          background: "var(--bg-primary)",
          border: "2px solid var(--border-primary)",
          "border-radius": "16px",
          "box-shadow": "0 0 10px rgba(0,0,0,0.2)"
        }
      }}
    />

    <Router>
      {/* @ts-expect-error */}
      {routes}
    </Router>
  </>
), document.getElementById("root") as HTMLDivElement);
