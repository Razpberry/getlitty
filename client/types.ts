export interface UserProfile {
  id: string;
  email: string;
  questionnaire_completed: boolean;
  preferences?: QuestionnaireData;
}

export interface QuestionnaireData {
  readingLevel: string;
  interests: string[];
  primaryGoal: string;
  dyslexiaFriendly: boolean;
  preferredLanguage: string;
  dailyReadingTime: string;
}

export type DocStatus = 'Uploaded' | 'Pending' | 'Ready' | 'Needs Review';

// Aligned with Supabase 'documents' table
export interface DocumentItem {
  id: string;
  name: string;      // Table column: name
  status: DocStatus; // Table column: status
  created_at: string; // Table column: created_at
  original?: string;  // Table column: original (text content)
  translated?: string; // Table column: translated (text content)
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface AccessibilityState {
  fontSize: 'normal' | 'large' | 'xlarge';
  toggleFontSize: () => void;
}
