// --- MOCK API SERVICE ---
// This file simulates a backend service using localStorage for data persistence.

import { 
    User, Role, Student, Exam, Question, Answer, StudentExamStatus, MonitoredStudent, 
    ExamResult, AssessmentType, QuestionType, ExamSettings, QuestionOption, MatchingPrompt, MatchingAnswer 
} from '../types';

const SIMULATED_DELAY = 500;

// --- Helper Functions ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Mock Database Initialization ---
const getDb = () => {
    try {
        const dbString = localStorage.getItem('cbt_db');
        if (dbString) {
            const db = JSON.parse(dbString);
            // Dates are stored as strings, so we need to parse them back
            if (db.exams) {
                db.exams.forEach((exam: Exam) => {
                    if (exam.startTime) exam.startTime = new Date(exam.startTime);
                    if (exam.endTime) exam.endTime = new Date(exam.endTime);
                });
            }
             if (db.results) {
                db.results.forEach((result: ExamResult) => {
                    if (result.submittedAt) result.submittedAt = new Date(result.submittedAt);
                });
            }
            return db;
        }
    } catch (error) {
        console.error("Failed to parse DB from localStorage", error);
    }
    return null;
};

const saveDb = (db: any) => {
    try {
        localStorage.setItem('cbt_db', JSON.stringify(db));
    } catch (error) {
        console.error("Failed to save DB to localStorage", error);
    }
};

const initialDb = {
    students: [
        { nis: '1001', name: 'Budi Santoso', class: 'VI A', room: '1', password: 'password123' },
        { nis: '1002', name: 'Citra Lestari', class: 'VI A', room: '1', password: 'password123' },
        { nis: '1003', name: 'Dewi Anggraini', class: 'VI B', room: '2', password: 'password123' },
    ],
    admins: [
        { id: 'admin', name: 'Admin Proktor', role: Role.ADMIN, password: 'admin123' },
    ],
    exams: [
        { id: 'exam1', name: 'Asesmen Literasi Paket 1', type: AssessmentType.LITERASI, duration: 60, questionCount: 2, token: 'TOKEN123' },
        { id: 'exam2', name: 'Asesmen Numerasi Paket 1', type: AssessmentType.NUMERASI, duration: 75, questionCount: 1 },
    ],
    questions: [
        { id: 'q1', examId: 'exam1', questionText: 'Siapakah presiden pertama Republik Indonesia?', type: QuestionType.SINGLE_CHOICE, options: [{id: 'q1o1', text: 'Soekarno'}, {id: 'q1o2', text: 'Soeharto'}, {id: 'q1o3', text: 'B.J. Habibie'}], correctAnswer: 'q1o1' },
        { id: 'q2', examId: 'exam1', questionText: 'Pilih dua pahlawan nasional Indonesia.', type: QuestionType.MULTIPLE_CHOICE_COMPLEX, options: [{id: 'q2o1', text: 'Pangeran Diponegoro'}, {id: 'q2o2', text: 'Gajah Mada'}, {id: 'q2o3', text: 'Cut Nyak Dien'}], correctAnswer: ['q2o1', 'q2o3'] },
        { id: 'q3', examId: 'exam2', questionText: 'Jika 5 + x = 12, berapakah nilai x?', type: QuestionType.SHORT_ANSWER, correctAnswer: '7' },
    ],
    results: [],
    studentStatuses: {},
    settings: {
        defaultDuration: 75,
        questionDisplay: 'single',
        allowNavigateBack: true,
        requireToken: false,
    }
};

let DB = getDb() || initialDb;
saveDb(DB);

// --- API Functions ---

// Auth
export const apiStudentLogin = async (nis: string, password: string): Promise<User | null> => {
    await delay(SIMULATED_DELAY);
    const student = DB.students.find((s: Student) => s.nis === nis && s.password === password);
    if (student) {
        DB.studentStatuses[nis] = StudentExamStatus.NOT_STARTED;
        saveDb(DB);
        return { id: student.nis, name: student.name, role: Role.STUDENT, class: student.class, room: student.room };
    }
    return null;
};

export const apiAdminLogin = async (username: string, password: string): Promise<User | null> => {
    await delay(SIMULATED_DELAY);
    const admin = DB.admins.find((a: User) => a.id === username && a.password === password);
    return admin || null;
};

// Student Management
export const apiGetStudents = async (): Promise<Student[]> => {
    await delay(SIMULATED_DELAY);
    return [...DB.students];
};

export const apiCreateStudent = async (student: Student): Promise<Student> => {
    await delay(SIMULATED_DELAY);
    if (DB.students.some((s: Student) => s.nis === student.nis)) {
        throw new Error("Siswa dengan NIS tersebut sudah ada.");
    }
    DB.students.push(student);
    saveDb(DB);
    return student;
};

export const apiUpdateStudent = async (student: Student): Promise<Student> => {
    await delay(SIMULATED_DELAY);
    const index = DB.students.findIndex((s: Student) => s.nis === student.nis);
    if (index === -1) throw new Error("Siswa tidak ditemukan.");
    DB.students[index] = { ...DB.students[index], ...student };
    saveDb(DB);
    return DB.students[index];
};

export const apiDeleteStudent = async (nis: string): Promise<void> => {
    await delay(SIMULATED_DELAY);
    DB.students = DB.students.filter((s: Student) => s.nis !== nis);
    saveDb(DB);
};

export const apiBulkDeleteStudents = async (nises: string[]): Promise<void> => {
    await delay(SIMULATED_DELAY);
    DB.students = DB.students.filter((s: Student) => !nises.includes(s.nis));
    saveDb(DB);
};

// Exam Management
export const apiGetExams = async (): Promise<Exam[]> => {
    await delay(SIMULATED_DELAY);
    // Recalculate question counts
    const examsWithCounts = DB.exams.map((exam: Exam) => ({
        ...exam,
        questionCount: DB.questions.filter((q: Question) => q.examId === exam.id).length,
    }));
    DB.exams = examsWithCounts;
    saveDb(DB);
    return [...DB.exams];
};

export const apiCreateExam = async (examData: Omit<Exam, 'id' | 'questionCount'>): Promise<Exam> => {
    await delay(SIMULATED_DELAY);
    const newExam: Exam = { ...examData, id: generateId(), questionCount: 0 };
    DB.exams.push(newExam);
    saveDb(DB);
    return newExam;
};

export const apiUpdateExam = async (examData: Exam): Promise<Exam> => {
    await delay(SIMULATED_DELAY);
    const index = DB.exams.findIndex((e: Exam) => e.id === examData.id);
    if (index === -1) throw new Error("Ujian tidak ditemukan.");
    DB.exams[index] = { ...DB.exams[index], ...examData };
    saveDb(DB);
    return DB.exams[index];
};

export const apiDeleteExam = async (examId: string): Promise<void> => {
    await delay(SIMULATED_DELAY);
    DB.exams = DB.exams.filter((e: Exam) => e.id !== examId);
    DB.questions = DB.questions.filter((q: Question) => q.examId !== examId);
    saveDb(DB);
};

// Question Management
export const apiGetQuestionsForExam = async (examId: string): Promise<Question[]> => {
    await delay(SIMULATED_DELAY);
    return DB.questions.filter((q: Question) => q.examId === examId);
};

export const apiCreateQuestion = async (examId: string, questionData: Omit<Question, 'id' | 'examId'>): Promise<Question> => {
    await delay(SIMULATED_DELAY);
    const newQuestion: Question = { ...questionData, id: generateId(), examId };
    DB.questions.push(newQuestion);
    // Update question count on exam
    const exam = DB.exams.find((e: Exam) => e.id === examId);
    if (exam) exam.questionCount++;
    saveDb(DB);
    return newQuestion;
};

export const apiUpdateQuestion = async (questionData: Question): Promise<Question> => {
    await delay(SIMULATED_DELAY);
    const index = DB.questions.findIndex((q: Question) => q.id === questionData.id);
    if (index === -1) throw new Error("Soal tidak ditemukan.");
    DB.questions[index] = { ...DB.questions[index], ...questionData };
    saveDb(DB);
    return DB.questions[index];
};

export const apiDeleteQuestion = async (questionId: string): Promise<void> => {
    await delay(SIMULATED_DELAY);
    const question = DB.questions.find((q: Question) => q.id === questionId);
    if (question) {
        const exam = DB.exams.find((e: Exam) => e.id === question.examId);
        if (exam && exam.questionCount > 0) exam.questionCount--;
    }
    DB.questions = DB.questions.filter((q: Question) => q.id !== questionId);
    saveDb(DB);
};

export const apiImportQuestions = async (examId: string, questions: Omit<Question, 'id' | 'examId'>[]): Promise<void> => {
    await delay(SIMULATED_DELAY * 2);
    // Clear existing questions for this exam
    DB.questions = DB.questions.filter((q: Question) => q.examId !== examId);
    
    // Add new questions
    const newQuestions: Question[] = questions.map(q => ({
        ...q,
        id: generateId(),
        examId: examId,
    }));
    DB.questions.push(...newQuestions);

    // Update question count
    const exam = DB.exams.find((e: Exam) => e.id === examId);
    if (exam) exam.questionCount = newQuestions.length;
    saveDb(DB);
};

// Student Experience
export const apiGetExamsForStudent = async (studentId: string): Promise<Exam[]> => {
    return apiGetExams(); // In this mock, all students see all exams
};

export const apiGetResultsForStudent = async (studentId: string): Promise<ExamResult[]> => {
    await delay(SIMULATED_DELAY);
    return DB.results.filter((r: ExamResult) => r.nis === studentId);
};

export const apiSubmitAnswers = async (studentId: string, examId: string, answers: Answer[]): Promise<void> => {
    await delay(SIMULATED_DELAY);
    const student = DB.students.find((s: Student) => s.nis === studentId);
    const exam = DB.exams.find((e: Exam) => e.id === examId);
    if (!student || !exam) throw new Error("Student or Exam not found");

    // Simple scoring logic
    let score = 0;
    const questionsForExam = DB.questions.filter((q: Question) => q.examId === examId);
    answers.forEach(answer => {
        const question = questionsForExam.find(q => q.id === answer.questionId);
        if (question && question.correctAnswer) {
            // This is a very basic scoring logic
            if (JSON.stringify(answer.value) === JSON.stringify(question.correctAnswer)) {
                score++;
            }
        }
    });

    const finalScore = questionsForExam.length > 0 ? Math.round((score / questionsForExam.length) * 100) : 100;

    const newResult: ExamResult = {
        nis: student.nis,
        name: student.name,
        class: student.class,
        examId: exam.id,
        examName: exam.name,
        score: finalScore,
        submittedAt: new Date(),
    };
    DB.results.push(newResult);
    DB.studentStatuses[studentId] = StudentExamStatus.FINISHED;
    saveDb(DB);
};


// Admin Dashboard
export const apiGetMonitoringData = async (): Promise<MonitoredStudent[]> => {
    await delay(200); // Faster refresh
    return DB.students.map((s: Student) => ({
        nis: s.nis,
        name: s.name,
        class: s.class,
        status: DB.studentStatuses[s.nis] || StudentExamStatus.NOT_STARTED,
    }));
};

export const apiGetExamResults = async (): Promise<ExamResult[]> => {
    await delay(SIMULATED_DELAY);
    return [...DB.results];
};

// Settings
export const apiGetExamSettings = async (): Promise<ExamSettings> => {
    await delay(SIMULATED_DELAY);
    return DB.settings;
};

export const apiSaveExamSettings = async (settings: ExamSettings): Promise<void> => {
    await delay(SIMULATED_DELAY);
    DB.settings = settings;
    saveDb(DB);
};

// Admin Profile
export const apiUpdateAdminProfile = async (adminId: string, name: string, password?: string): Promise<User> => {
    await delay(SIMULATED_DELAY);
    const admin = DB.admins.find((a: User) => a.id === adminId);
    if (!admin) throw new Error("Admin not found.");
    admin.name = name;
    if (password) {
        admin.password = password;
    }
    saveDb(DB);
    return { ...admin };
};

export const apiResetAdminPassword = async (adminId: string): Promise<void> => {
    await delay(SIMULATED_DELAY);
    const admin = DB.admins.find((a: User) => a.id === adminId);
    if (!admin) throw new Error("Admin not found.");
    admin.password = 'admin123';
    saveDb(DB);
};