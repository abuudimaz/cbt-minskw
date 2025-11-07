
export interface User {
  id: string; // NIS for student, username for admin
  name: string;
  role: 'student' | 'admin';
  class?: string;
  room?: string;
}

export enum Role {
    STUDENT = 'student',
    ADMIN = 'admin',
}

export enum AssessmentType {
    LITERASI = 'Literasi',
    NUMERASI = 'Numerasi',
    SURVEI_KARAKTER = 'Survei Karakter',
    SURVEI_LINGKUNGAN = 'Survei Lingkungan Belajar'
}

export enum QuestionType {
    MULTIPLE_CHOICE = 'Pilihan Ganda',
    SURVEY = 'Survei Skala',
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

export interface Question {
  id: string;
  examId: string;
  questionText: string;
  type: QuestionType;
  options: { id: string, text: string }[];
  correctAnswer?: string; // id of the correct option
}

export interface Answer {
  questionId: string;
  selectedOptionId: string;
}

export interface Student {
    nis: string;
    name: string;
    class: string;
    room: string;
    password?: string; // Only used for creation/update, not sent to client
}

export enum StudentExamStatus {
    NOT_STARTED = 'Belum Mulai',
    IN_PROGRESS = 'Sedang Mengerjakan',
    FINISHED = 'Selesai',
    LOGGED_OUT = 'Keluar Sesi'
}

export interface MonitoredStudent {
    nis: string;
    name: string;
    class: string;
    status: StudentExamStatus;
    startTime?: Date;
    finishTime?: Date;
    score?: number;
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
    LOGIN_SELECTOR = 'LOGIN_SELECTOR',
    STUDENT_LOGIN = 'STUDENT_LOGIN',
    ADMIN_LOGIN = 'ADMIN_LOGIN',
    STUDENT_DASHBOARD = 'STUDENT_DASHBOARD',
    ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
    STUDENT_EXAM = 'STUDENT_EXAM',
}
