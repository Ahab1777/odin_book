import type { BasicUser } from "./auth";


export type FriendsResponse = {
  friends: Array<BasicUser>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalFriendships: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type PendingRequestsResponse = {
  pendingRequests: Array<BasicUser>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
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
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type FriendRequestResponse = {
  id: string;
  requesterId: string;
  receiverId: string;
  createdAt: Date;
  status: string;
};
