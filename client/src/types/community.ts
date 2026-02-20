import type { BasicUser } from "./auth";

export type FriendsResponse = {
    friendships: Array<BasicUser>
}

export type PendingRequestsResponse = {
    pendingRequests: Array<BasicUser>
}

export type CreateFriendshipResponse = {
    id: string;
    user1Id: string;
    user2Id: string;
    createdAt: Date;
    requestStatus: string;
}