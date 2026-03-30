import type { BasicUser } from "./auth";


export type PostIndexResponse = {
  posts: PostCardContent[];
};


export type PostCardContent = {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: BasicUser;
}




export type Comment = {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: string;
};

export type Like = {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
};

export type UserPostCardContent = Omit<PostCardContent, "user"> & {
  comments: Comment[];
  likes: Like[];
};

export type UserPostIndexResponse = {
  posts: UserPostCardContent[];
};