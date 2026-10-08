export type User = {
  id: string;
  name: string;
  username: string;
  userCode: string | null;
  role: "student" | "admin";
  grade: string | null;
};

export type Course = {
  id: string;
  name: string;
  topic: string;
  progress: number;
  lessons: string;
  completed_lessons: number;
  total_lessons: number;
  icon: string;
  color: string;
};

export type UpcomingExam = {
  id: string;
  title: string;
  kind: string;
  duration_minutes: number;
  opens_at: string;
  subject_name: string;
};

export type LearningResource = {
  id: string;
  title: string;
  description: string;
  topic: string;
  term: string;
  category: "revision-paper" | "study-guide" | "syllabus" | "topic-summary" | "reference-document";
  filename: string;
  sizeBytes: number;
  subjectId: string;
  subjectName: string;
  grade: string;
};

export type DashboardData = {
  student: User;
  curriculumRegistration: {
    complete: boolean;
    pathway: string | null;
    grade: string | null;
  };
  courses: Course[];
  upcomingExams: UpcomingExam[];
  resources: LearningResource[];
  stats: {
    lessonsCompleted: number;
    lessonsTotal: number;
    learningProgress: number;
    streakDays: number;
    completedExams: number;
    examsInProgress: number;
  };
};

export type CurriculumSubject = {
  id: string;
  name: string;
  topic: string;
  icon: string;
  color: string;
  grade: string;
};

export type CurriculumPathway = {
  id: "stem" | "arts-sports" | "social-sciences";
  name: string;
  shortName: string;
  description: string;
  subjects: CurriculumSubject[];
};

export type CurriculumRegistration = {
  grade: string | null;
  needsGrade: boolean;
  complete: boolean;
  pathway: CurriculumPathway["id"] | null;
  subjects: CurriculumSubject[];
  compulsory: CurriculumSubject[];
  pathways: CurriculumPathway[];
  selectedSubjectIds: string[];
};

const tokenKey = "jifunze.session";
export const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL ?? "vortexlearning0@gmail.com";

export class ApiRequestError extends Error {
  constructor(message: string, readonly suggestions: string[] = []) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export function getToken(): string | null {
  return localStorage.getItem(tokenKey);
}

export function setToken(token: string): void {
  localStorage.setItem(tokenKey, token);
}

export function clearToken(): void {
  localStorage.removeItem(tokenKey);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof Blob) && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(path, { ...options, headers });
  } catch {
    throw new Error("The learning service is unavailable. Check that the backend is running and try again.");
  }

  const data = await response.json().catch(() => ({})) as { error?: string; suggestions?: string[] };
  if (!response.ok) {
    if (response.status === 401) clearToken();
    throw new ApiRequestError(data.error ?? "The request could not be completed.", data.suggestions ?? []);
  }
  return data as T;
}

export async function apiFileRequest(path: string): Promise<Blob> {
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(path, { headers });
  } catch {
    throw new Error("The learning service is unavailable. Check your connection and try again.");
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (response.status === 401) clearToken();
    throw new Error(data.error ?? "This learning resource could not be opened.");
  }
  return response.blob();
}
