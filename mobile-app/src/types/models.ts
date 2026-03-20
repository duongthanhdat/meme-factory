export type MemeFormat = "1:1" | "9:16" | "16:9" | "4:5";

export type EmotionTag =
  | "happy"
  | "sad"
  | "angry"
  | "surprised"
  | "confused"
  | "cool"
  | "love"
  | "scared"
  | "thinking"
  | "laughing"
  | "crying"
  | "neutral"
  | "excited"
  | "tired"
  | "custom";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  style_prompt: string | null;
  watermark_url: string | null;
  default_format: MemeFormat;
  created_at: string;
  updated_at: string;
}

export interface CharacterPose {
  id: string;
  character_id: string;
  name: string;
  emotion: EmotionTag;
  image_url: string;
  description: string | null;
  is_transparent: boolean;
  created_at: string;
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  description: string;
  personality: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  poses: CharacterPose[];
}

export interface SelectedCharacter {
  character_id: string;
  character_name: string;
  pose_id: string;
  pose_name: string;
  emotion: EmotionTag;
  reasoning?: string;
  suggested_emotion?: string;
}

export interface MemeContent {
  headline: string;
  subtext?: string;
  caption?: string;
  image_prompt?: string;
  text_rendering_notes?: string;
  tone: string;
  layout_suggestion: {
    text_position: "top" | "bottom" | "center" | "split";
    character_positions: Array<Record<string, unknown>>;
  };
}

export interface Meme {
  id: string;
  project_id: string;
  source_meme_id?: string | null;
  original_idea: string;
  generated_content: MemeContent;
  selected_characters: SelectedCharacter[];
  format: MemeFormat;
  image_url: string | null;
  has_watermark: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ContentVariation {
  content: MemeContent;
  suggested_characters: SelectedCharacter[];
  headline: string;
  subtext?: string;
  caption?: string;
  image_prompt?: string;
  text_rendering_notes?: string;
  tone: string;
  text_position: "top" | "bottom" | "center" | "split";
}

export interface WalletBalanceResponse {
  balance: number;
  points: number;
  transactions: Transaction[];
  pendingOrders: TopupOrder[];
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  status: string;
  created_at: string;
}

export interface TopupOrder {
  id: string;
  amount: number;
  status: string;
  payment_id: string;
  created_at: string;
}

export interface ProjectWalletResponse {
  project_id: string;
  points: number;
  transactions: Transaction[];
}

export interface ProjectMember {
  user_id: string;
  email: string;
  role: string;
  is_owner: boolean;
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  project_name: string;
  invited_by_email: string;
  created_at: string;
}
