export type Role = 'admin' | 'user';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface SupportMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'spreadsheet' | 'url' | 'other';
  url: string;
}

export interface VideoSlot {
  id: string;
  title: string;
  url: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  videos: VideoSlot[];
  materials: SupportMaterial[];
  quizzes: Quiz[];
}

export interface UserProgress {
  watchedVideos: string[]; // video ids
  accessedMaterials: string[]; // material ids
  quizResults: { [quizId: string]: { score: number; completed: boolean; answers: number[] } };
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  type: 'pdf' | 'url';
  url: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  type: 'video' | 'document' | 'url';
  url: string;
}

export interface AppData {
  modules: TrainingModule[];
  cases: CaseStudy[];
  faq: FAQItem[];
  library: LibraryItem[];
}
