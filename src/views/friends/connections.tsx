import {
  createResource,
  createSignal,
  For,
  Show,
  type Component,
} from "solid-js";

import MdiMagnify from "~icons/mdi/magnify";

import { getRelationshipsFriends } from "../../api/requests/relationships/friends/list";
import { getSearchProfile, type GetSearchProfile } from "~/api/requests/search/profile";
import ProfilePicture from "~/components/profile-picture";
import { postRelationshipsFriendRequests } from "~/api/requests/relationships/friends/send";
import InviteCallout from "~/components/friends/invite-callout";

const FriendsConnectionsView: Component = () => {
  const [friends] = createResource(() => getRelationshipsFriends());
  const [searchQuery, setSearchQuery] = createSignal("");
  const [profilesQuery, { refetch: profilesQueryRefetch }] = createResource(searchQuery, (query) => getSearchProfile(query).catch(() => void 0));

  const filteredFriends = () => {
    const query = searchQuery().toLowerCase();
    const friendsList = friends() || [];

    if (!query) return friendsList;

    return friendsList.filter(
      (friend) =>
        friend.username.toLowerCase().includes(query) ||
        friend.fullname.toLowerCase().includes(query)
    );
  };

  const SearchProfileEntry: Component<{ profile: GetSearchProfile["data"][number] }> = (props) => {
    const [loading, setLoading] = createSignal(false);

    const handleAdd = async () => {
      try {
        setLoading(true);
        await postRelationshipsFriendRequests(props.profile.id);
        await profilesQueryRefetch();
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
            <p class="text-sm" style={{"color": "var(--text-secondary)"}}>@{props.profile.username}</p>
          </div>
        </a>
        <button type="button" class="shrink-0 uppercase font-600 rounded-full text-xs px-2.5 py-1.5 disabled:opacity-50" style={{"background-color": "var(--overlay-strong)", "color": "var(--text-primary)"}}
          disabled={loading() || props.profile.status === "sent" || props.profile.status === "accepted"}
          onClick={handleAdd}
        >
          {
            props.profile.status === "sent"
              ? "Sent" :
            props.profile.status === "accepted"
              ? "Accepted" :
            "Add"
          }
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Query input to search for friends or new users. */}
      <div class="mb-6">
        <div class="relative flex items-center">
          <MdiMagnify class="absolute w-6 h-6 left-4 text-2xl" style={{"color": "var(--text-tertiary)"}} />
          <input
            type="text"
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            class="w-full rounded-xl py-2.5 pl-14 pr-4 text-[16px] focus:outline-none"
            style={{"background-color": "var(--bg-secondary)", "color": "var(--text-primary)"}}
            placeholder="Add or search friends"
          />
        </div>
      </div>

      <InviteCallout />

      {/* Show friends and also friends related to the query. */}
      <Show when={friends() && ((searchQuery().length >= 3 && filteredFriends().length !== 0) || searchQuery().length < 3)}>
        <section>
          <h2 class="text-sm uppercase font-600 mb-4" style={{"color": "var(--text-secondary)"}}>
            My Friends ({filteredFriends().length})
          </h2>

          <div class="flex flex-col gap-2">
            <For each={filteredFriends()} fallback={<p class="text-sm">No friends found, add some!</p>}>
              {(friend) => (
                <a href={`/user/${friend.id}`} class="flex items-center gap-4 p-1.5 rounded-lg focus:scale-[0.98] active:scale-95 transition-transform">
                  <div class="relative">
                    <ProfilePicture
                      fullName={friend.fullname}
                      username={friend.username}
                      media={friend.profilePicture}
                      size={60}
                    />
                  </div>

                  <div class="flex flex-col">
                    <p class="font-500">{friend.fullname}</p>
                    <p class="text-sm" style={{"color": "var(--text-secondary)"}}>@{friend.username}</p>
                  </div>
                </a>
              )}
            </For>
          </div>
        </section>
      </Show>

      {/* Show results of the query. */}
      <Show when={searchQuery().length >= 3 && profilesQuery()}>
        {profiles => (
          <section class="mt-4">
            <h2 class="text-sm uppercase font-600 mb-4" style={{"color": "var(--text-secondary)"}}>
              More Results ({profiles().data.length})
            </h2>

            <For each={profiles().data}>
              {profile => (
                <SearchProfileEntry profile={profile} />
              )}
            </For>
          </section>
        )}
      </Show>
    </>
  );
};

export default FriendsConnectionsView;
