// --- TYPE DEFINITIONS ---

export enum Role {
    STUDENT = 'student',
    ADMIN = 'admin',
}

export interface User {
    id: string;
    name: string;
    role: Role;
    class?: string;
    room?: string;
    password?: string;
}

export interface Student {
    nis: string;
    name: string;
    class: string;
    room: string;
    password: string;
}

export enum AssessmentType {
    LITERASI = 'Literasi',
    NUMERASI = 'Numerasi',
    SURVEI_KARAKTER = 'Survei Karakter',
}

export interface Exam {
    id: string;
    name: string;
    type: AssessmentType;
    duration: number; // in minutes
    questionCount: number;
    token?: string;
    startTime?: Date;
    endTime?: Date;
    order?: number;
}

export enum QuestionType {
    SINGLE_CHOICE = 'Pilihan Ganda',
    MULTIPLE_CHOICE_COMPLEX = 'Pilihan Ganda Kompleks',
    MATCHING = 'Menjodohkan',
    SHORT_ANSWER = 'Isian Singkat',
    ESSAY = 'Uraian',
    SURVEY = 'Survey', // Kept for character surveys
}

export interface QuestionOption {
    id: string;
    text: string;
    optionImageUrl?: string;
}

export interface MatchingPrompt {
    id: string;
    text: string;
}

export interface MatchingAnswer {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    examId: string;
    questionText: string;
    questionImageUrl?: string;
    type: QuestionType;
    // For single/complex choice
    options?: QuestionOption[];
    // For matching
    matchingPrompts?: MatchingPrompt[];
    matchingAnswers?: MatchingAnswer[];
    // Can be string (single choice id), string[] (complex choice ids), or Record<string, string> (matching promptId:answerId)
    // FIX: Added Record<string, string> to support matching questions' correct answer format.
    correctAnswer?: string | string[] | Record<string, string>;
}

export interface Answer {
    questionId: string;
    // Can be string (single choice, short answer, essay), string[] (complex choice), or Record<string, string> (matching)
    value: any;
}


export enum StudentExamStatus {
    NOT_STARTED = 'Belum Mulai',
    IN_PROGRESS = 'Mengerjakan',
    FINISHED = 'Selesai',
    LOGGED_OUT = 'Logout',
}

export interface MonitoredStudent {
    nis: string;
    name: string;
    class: string;
    status: StudentExamStatus;
}

export interface ExamResult {
    nis: string;
    name: string;
    class: string;
    examId: string;
    examName: string;
    score: number;
    submittedAt: Date;
}

export enum AppView {
    LOGIN_SELECTOR,
    STUDENT_LOGIN,
    ADMIN_LOGIN,
    STUDENT_DASHBOARD,
    ADMIN_DASHBOARD,
    STUDENT_EXAM,
}

export interface ExamSettings {
    defaultDuration: number;
    questionDisplay: 'single' | 'all';
    allowNavigateBack: boolean;
    requireToken: boolean;
}