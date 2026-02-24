import type { BasicUser, Like, Comment } from "./auth";

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

export type Post = {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: Array<Like>;
  comments: Array<Comment>;
};

export type UserProfile = {
  id: string;
  username: string;
  posts: Array<Post>;
  friends: Array<BasicUser>;
  bio: string;
  avatar: string;
};
