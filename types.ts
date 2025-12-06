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

export interface DocumentItem {
  id: string;
  title: string;
  status: DocStatus;
  uploadDate: string;
  originalUrl?: string;
  simplifiedUrl?: string;
  preview?: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface AccessibilityState {
  fontSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  toggleFontSize: () => void;
  toggleHighContrast: () => void;
}
