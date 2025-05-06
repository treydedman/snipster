export interface User {
  id: string;
  email: string;
  username?: string;
  github_username?: string;
  avatar_url?: string;
}

export interface Snippet {
  id: string;
  owner: string;
  title: string;
  language: string;
  content: string;
  tags: string[];
  description?: string;
  created_at: string;
  updated_at: string;
  shares?: { share_token: string }[];
}
