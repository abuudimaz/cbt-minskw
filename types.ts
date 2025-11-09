// --- TYPE DEFINITIONS ---

export enum Role {
    ADMIN = 'admin',
    STUDENT = 'student',
}

export enum AppView {
    LOGIN_SELECTOR,
    STUDENT_LOGIN,
    ADMIN_LOGIN,
    STUDENT_DASHBOARD,
    ADMIN_DASHBOARD,
    STUDENT_EXAM,
}

export interface User {
    id: string;
    name: string;
    role: Role;
    nis?: string;
    class?: string;
    room?: string;
}

export interface Student {
    nis: string;
    name: string;
    class: string;
    room: string;
    password?: string;
}

export enum AssessmentType {
    LITERASI = "Literasi",
    NUMERASI = "Numerasi",
    SAINS = "Sains",
    SOSIAL = "Sosial",
    AGAMA = "Agama",
}

export interface Exam {
    id: string;
    name: string;
    type: AssessmentType;
    duration: number; // in minutes
    questionCount: number;
    token?: string;
    startTime?: Date | string;
    endTime?: Date | string;
}

export enum QuestionType {
    SINGLE_CHOICE = "Pilihan Ganda",
    MULTIPLE_CHOICE_COMPLEX = "Pilihan Ganda Kompleks",
    MATCHING = "Menjodohkan",
    SHORT_ANSWER = "Isian Singkat",
    ESSAY = "Uraian",
    SURVEY = "Survei",
}

export interface QuestionOption {
    id: string;
    text: string;
    optionImageUrl?: string;
}

export interface MatchingItem {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    examId: string;
    questionText: string;
    questionImageUrl?: string;
    type: QuestionType;
    options?: QuestionOption[];
    matchingPrompts?: MatchingItem[];
    matchingAnswers?: MatchingItem[];
    correctAnswer?: any; // Can be string for single choice/short answer, string[] for complex, or Record<string, string> for matching
}

export interface Answer {
    questionId: string;
    value: any;
}

export interface Submission {
    id: string;
    studentId: string;
    examId: string;
    answers: Answer[];
    submittedAt: string;
    score?: number;
}

export interface ExamResult {
    id: string;
    nis: string;
    name: string;
    class: string;
    examId: string;
    examName: string;
    score: number;
    submittedAt: string;
}

export enum StudentExamStatus {
    NOT_STARTED = "Belum Mulai",
    IN_PROGRESS = "Mengerjakan",
    FINISHED = "Selesai",
    LOGGED_OUT = "Logout",
}

export interface MonitoredStudent {
    nis: string;
    name: string;
    class: string;
    status: StudentExamStatus;
}

export interface ExamSettings {
    assessmentTitle: string;
    academicYear: string;
    proctorName: string;
    headmasterName: string;
    headmasterNip: string;
    questionDisplay: 'single' | 'all';
    multipleChoiceComplexStyle: 'checkbox' | 'toggle';
}
