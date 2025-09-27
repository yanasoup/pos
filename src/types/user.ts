export type User = {
  id: number;
  name: string;
  email: string;
  headline?: string;
  avatarUrl?: string;
  role_id: string;
};

export type DBUser = User & {
  role_name: string;
};

export type UpdateUserParams = {
  name: string;
  headline: string;
  avatar: string;
};

export type GetUserResponse = User & { password: string };
