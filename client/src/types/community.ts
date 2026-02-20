import type { BasicUser } from "./auth";

export type FriendsResponse = {
  friendships: Array<BasicUser>;
};

export type PendingRequestsResponse = {
  pendingRequests: Array<BasicUser>;
};

export type CreateFriendshipResponse = {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  requestStatus: string;
};

export type UnknownUsersResponse = {
  unknownUsers: Array<BasicUser>;
};

export type FriendRequestResponse = {
  id: string;
  requesterId: string;
  receiverId: string;
  createdAt: Date;
  status: string;
};
