import { createResource, createSignal, For, Show, type Component } from "solid-js";
import { relationships_friends_received, type RelationshipsFriendsReceived } from "~/api/requests/relationships/friends/received";
import { relationships_friends_sent, type RelationshipsFriendsSent } from "~/api/requests/relationships/friends/sent";
import { relationships_friends_accept } from "~/api/requests/relationships/friends/accept";
import ProfilePicture from "~/components/profile-picture";
import MdiClose from '~icons/mdi/close'
import { relationships_friends_reject } from "~/api/requests/relationships/friends/reject";
import { confirm } from "@tauri-apps/plugin-dialog";
import InviteCallout from "~/components/friends/invite-callout";
import { relationships_friends_cancel } from "~/api/requests/relationships/friends/cancel";

const FriendsRequestsView: Component = () => {
  const [requests, { refetch: requestsRefetch }] = createResource(relationships_friends_received);
  const [sentRequests, { refetch: sentRequestsRefetch }] = createResource(relationships_friends_sent);

  const RequestEntry: Component<{ profile: RelationshipsFriendsReceived["data"][number] }> = (props) => {
    const [loading, setLoading] = createSignal(false);

    const handleAcceptRequest = async () => {
      try {
        setLoading(true);
        await relationships_friends_accept(props.profile.id);
        await requestsRefetch();
      }
      finally {
        setLoading(false);
      }
    };

    const handleRejectRequest = async () => {
      const shouldReject = await confirm(`You will not see this friend request anymore and ${props.profile.username} will not be notified.`, {
        title: `Are you sure you want to delete the friend request from ${props.profile.username}?`,
        cancelLabel: "Cancel",
        okLabel: "Delete",
        kind: "warning"
      });

      if (!shouldReject) return;

      try {
        setLoading(true);
        await relationships_friends_reject(props.profile.id);
        await requestsRefetch();
      }
      finally {
        setLoading(false);
      }
    }

    return (
      <div class="flex items-center justify-between">
        <a href={`/user/${props.profile.id}`} class="w-full flex items-center gap-4 p-1.5 rounded-lg focus:scale-[0.98] active:scale-95 transition-transform">
          <div class="relative">
            <ProfilePicture
              fullName={props.profile.fullname}
              username={props.profile.username}
              media={props.profile.profilePicture}
              size={60}
            />
          </div>

          <div class="flex flex-col">
            <p class="font-500">{props.profile.fullname}</p>
            <p class="text-sm text-white/60">@{props.profile.username}</p>
          </div>
        </a>
        <button type="button" class="shrink-0 bg-white/15 text-white/75 uppercase font-600 rounded-full text-xs px-3 py-1.5 disabled:opacity-50"
          disabled={loading()}
          onClick={handleAcceptRequest}
        >
          Accept
        </button>
        <button type="button" class="ml-2 -mr-2 p-2 rounded-full"
          disabled={loading()}
          onClick={handleRejectRequest}
        >
          <MdiClose class="text-white/60" />
        </button>
      </div>
    )
  };

  const SentRequestEntry: Component<{ profile: RelationshipsFriendsSent["data"][number] }> = (props) => {
    const [loading, setLoading] = createSignal(false);

    const handleRemoveRequest = async () => {
      const shouldReject = await confirm(`${props.profile.username} will not see your friend request anymore and will not be notified.`, {
        title: `Are you sure you want to delete the friend request sent to ${props.profile.username}?`,
        cancelLabel: "Cancel",
        okLabel: "Delete",
        kind: "warning"
      });

      if (!shouldReject) return;

      try {
        setLoading(true);
        await relationships_friends_cancel(props.profile.id);
        await sentRequestsRefetch();
      }
      finally {
        setLoading(false);
      }
    }

    return (
      <div class="flex items-center justify-between">
        <a href={`/user/${props.profile.id}`} class="w-full flex items-center gap-4 p-1.5 rounded-lg focus:scale-[0.98] active:scale-95 transition-transform">
          <div class="relative">
            <ProfilePicture
              fullName={props.profile.fullname}
              username={props.profile.username}
              media={props.profile.profilePicture}
              size={60}
            />
          </div>

          <div class="flex flex-col">
            <p class="font-500">{props.profile.fullname}</p>
            <p class="text-sm text-white/60">@{props.profile.username}</p>
          </div>
        </a>
        <button type="button" class="shrink-0 bg-white/15 text-white/75 uppercase font-600 rounded-full text-xs px-3 py-1.5 opacity-50"
          disabled={true}
        >
          Added
        </button>
        <button type="button" class="ml-2 -mr-2 p-2 rounded-full"
          disabled={loading()}
          onClick={handleRemoveRequest}
        >
          <MdiClose class="text-white/60" />
        </button>
      </div>
    )
  };

  return (
    <>
      <InviteCallout />

      <Show when={requests()}>
        <section>
          <h2 class="text-sm text-white/60 uppercase font-600">
            Friend Requests ({requests()!.data.length})
          </h2>
          <Show when={requests()!.data.length > 0}>
            <p class="text-white/30 text-sm mt-2">
              Don't feel like you have to accept all those friend requests
            </p>
          </Show>

          <div class="flex flex-col gap-2 py-4">
            <For each={requests()!.data} fallback={
              <div class="text-center bg-[#1c1c1e] rounded-xl p-4">
                <p class="font-600 pb-2">No pending requests</p>
                <p>You don't have any pending requests.</p>
              </div>
            }>
              {(request) => <RequestEntry profile={request} />}
            </For>
          </div>
        </section>
      </Show>

      <Show when={sentRequests() && sentRequests()!.data.length > 0}>
        <section class="mt-4">
          <h2 class="text-sm text-white/60 uppercase font-600">
            Sent Requests ({sentRequests()!.data.length})
          </h2>

          <div class="flex flex-col gap-2 py-4">
            <For each={sentRequests()!.data}>
              {(request) => <SentRequestEntry profile={request} />}
            </For>
          </div>
        </section>
      </Show>
    </>
  )
};

export default FriendsRequestsView;
