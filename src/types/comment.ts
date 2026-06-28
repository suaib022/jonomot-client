export interface IComment {
  comment_id?: number;
  post_id: number;
  user_id?: number;
  parent_comment_id?: number | null;
  body: string;
  upvote_count?: number;
  downvote_count?: number;
  is_removed?: boolean;
  created_at?: string;
  updated_at?: string;
  username?: string;
  // Oracle uppercase keys
  COMMENT_ID?: number;
  POST_ID?: number;
  USER_ID?: number;
  PARENT_COMMENT_ID?: number | null;
  BODY?: string;
  UPVOTE_COUNT?: number;
  DOWNVOTE_COUNT?: number;
  IS_REMOVED?: boolean;
  CREATED_AT?: string;
  UPDATED_AT?: string;
  USERNAME?: string;
  // for tree building
  children?: IComment[];
  replies?: IComment[];
}
