import type { BasicUser } from "./auth";

export type FriendsResponse = {
    friendships: Array<BasicUser>
}

export type PendingRequestsResponse = {
    pendingRequests: Array<BasicUser>
}