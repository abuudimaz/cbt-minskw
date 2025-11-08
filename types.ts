// FIX: Removed self-import of 'Role' which was causing a conflict with the local enum declaration.
export enum Role {
    STUDENT = 'student',
    ADMIN = 'admin',
}

export type User = {
    id: string; // for admin it's username, for student it's nis
    name: string;
    role: Role;
    // Student-specific
    nis?: string;
    class?: string;
    room?: string;
};

export type Student = {
    nis: string;
    name: string;
    class: string;
    room: string;
    password?: string; // only for creation/update
};

export enum AppView {
    LOGIN_SELECTOR = 'login_selector',
    STUDENT_LOGIN = 'student_login',
    ADMIN_LOGIN = 'admin_login',
    STUDENT_DASHBOARD = 'student_dashboard',
    ADMIN_DASHBOARD = 'admin_dashboard',
    STUDENT_EXAM = 'student_exam',
}

export enum AssessmentType {
    LITERASI = 'Literasi',
    NUMERASI = 'Numerasi',
    SAINS = 'Sains',
    SOSIAL = 'Sosial',
    LAINNYA = 'Lainnya',
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
}

export enum QuestionType {
    SINGLE_CHOICE = 'Pilihan Ganda',
    MULTIPLE_CHOICE_COMPLEX = 'Pilihan Ganda Kompleks',
    MATCHING = 'Menjodohkan',
    SHORT_ANSWER = 'Isian Singkat',
    ESSAY = 'Esai',
    SURVEY = 'Survei', // Not used in forms, but good to have
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
    correctAnswer?: any; // string for single choice/short answer, string[] for multiple choice, Record<string, string> for matching
}

export interface Answer {
    questionId: string;
    value: any;
}

export interface ExamResult {
    id: string;
    nis: string;
    name: string; // student name
    class: string;
    examId: string;
    examName: string;
    score: number;
    submittedAt: string; // ISO date string
}

export enum StudentExamStatus {
    NOT_STARTED = 'Belum Mulai',
    IN_PROGRESS = 'Mengerjakan',
    FINISHED = 'Selesai',
    LOGGED_OUT = 'Logout', // Or some other status for disconnected
}

export interface MonitoredStudent {
    nis: string;
    name: string;
    class: string;
    status: StudentExamStatus;
}

export interface Submission {
    id: string;
    studentId: string;
    examId: string;
    answers: Answer[];
    submittedAt: string; // ISO date string
    score?: number;
}

export interface ExamSettings {
    assessmentTitle: string;
    academicYear: string;
    proctorName: string;
    headmasterName: string;
    headmasterNip: string;
    questionDisplay: 'single' | 'all';
}