export type LoginResponse = {
  token: string;
  userId: string;
  username: string;
  email: string;
  avatar: string;
};

export type ValidationErrorItem = {
  path?: string;
  msg?: string;
};

export type ApiValidationError = {
  status?: number;
  data?: {
    errors?: ValidationErrorItem[];
  };
  message: string;
};

export type SignupResponse = {
  token: string;
  userId: string;
  username: string;
  avatar: string;
};

export type PostIndexResponse = {
  posts: PostCardContent[];
};

type PostCardContentUser = {
  id: string;
  username: string;
  avatar: string;
}

export type PostCardContent = {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: PostCardContentUser;
}

type Comment = {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: string;
};

type Like = {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
};

export type UserPostCardContent = Omit<PostCardContent, "user"> & {
  comments: Comment[];
  likes: Like[];
};