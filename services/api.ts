import {
    User,
    Role,
    Student,
    Exam,
    Question,
    Answer,
    MonitoredStudent,
    StudentExamStatus,
    ExamResult,
    ExamSettings,
    AssessmentType,
    QuestionType
} from '../types';

// --- MOCK DATABASE & HELPERS ---

const DB_KEY = 'cbt_mock_db';

const defaultDB = {
    students: [
        { nis: '1001', name: 'Budi Santoso', class: '6A', room: '1', password: 'password123' },
        { nis: '1002', name: 'Citra Lestari', class: '6A', room: '1', password: 'password123' },
        { nis: '1003', name: 'Dewi Anggraini', class: '6B', room: '2', password: 'password123' },
    ],
    admins: [
        { id: 'admin', name: 'Admin Proktor', role: Role.ADMIN, password: 'admin' },
    ],
    exams: [
        { id: 'exam1', name: 'Asesmen Literasi Paket 1', type: AssessmentType.LITERASI, duration: 60, questionCount: 2, token: 'TOKEN123', order: 0 },
        { id: 'exam2', name: 'Asesmen Numerasi Paket 1', type: AssessmentType.NUMERASI, duration: 75, questionCount: 1, order: 1 },
        { id: 'exam3', name: 'Survei Karakter', type: AssessmentType.SURVEI_KARAKTER, duration: 30, questionCount: 0, order: 2 },
    ],
    questions: [
        { id: 'q1', examId: 'exam1', questionText: 'Apa ibu kota Indonesia?', type: QuestionType.SINGLE_CHOICE, options: [{id: 'q1o1', text: 'Jakarta'}, {id: 'q1o2', text: 'Bandung'}, {id: 'q1o3', text: 'Surabaya'}], correctAnswer: 'q1o1' },
        { id: 'q2', examId: 'exam1', questionText: 'Pilih dua angka genap.', type: QuestionType.MULTIPLE_CHOICE_COMPLEX, options: [{id: 'q2o1', text: '2'}, {id: 'q2o2', text: '3'}, {id: 'q2o3', text: '4'}], correctAnswer: ['q2o1', 'q2o3'] },
        { id: 'q3', examId: 'exam2', questionText: '2 + 2 = ?', type: QuestionType.SHORT_ANSWER, correctAnswer: '4' },
    ],
    results: [],
    studentStatuses: {}, // { nis: { examId: string, status: StudentExamStatus } }
    settings: {
        defaultDuration: 90,
        questionDisplay: 'single',
        allowNavigateBack: true,
        requireToken: false,
    }
};

const getDb = () => {
    try {
        const dbString = localStorage.getItem(DB_KEY);
        if (dbString) {
            const db = JSON.parse(dbString);
            // Ensure all keys from defaultDB exist to handle migrations
            return { ...defaultDB, ...db };
        }
        localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
        return defaultDB;
    } catch (e) {
        console.error("Failed to access localStorage DB", e);
        return defaultDB;
    }
};

const saveDb = (db: any) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


// --- API FUNCTIONS ---

// Auth
export const apiStudentLogin = async (nis: string, password: string): Promise<User | null> => {
    await delay(500);
    const db = getDb();
    const student = db.students.find((s: Student) => s.nis === nis && s.password === password);
    if (student) {
        return {
            id: student.nis,
            name: student.name,
            role: Role.STUDENT,
            class: student.class,
            room: student.room,
        };
    }
    return null;
};

export const apiAdminLogin = async (username: string, password: string): Promise<User | null> => {
    await delay(500);
    const db = getDb();
    const admin = db.admins.find((a: any) => a.id === username && a.password === password);
    return admin ? { ...admin } : null;
};

// Students
export const apiGetStudents = async (): Promise<Student[]> => {
    await delay(500);
    const db = getDb();
    return [...db.students];
};

export const apiCreateStudent = async (studentData: Omit<Student, 'nis'> & { nis: string }): Promise<Student> => {
    await delay(500);
    const db = getDb();
    if (db.students.some((s: Student) => s.nis === studentData.nis)) {
        throw new Error('NIS sudah ada.');
    }
    const newStudent = { ...studentData };
    db.students.push(newStudent);
    saveDb(db);
    return newStudent;
};

export const apiUpdateStudent = async (studentData: Student): Promise<Student> => {
    await delay(500);
    const db = getDb();
    const index = db.students.findIndex((s: Student) => s.nis === studentData.nis);
    if (index === -1) {
        throw new Error('Siswa tidak ditemukan.');
    }
    db.students[index] = { ...db.students[index], ...studentData };
    saveDb(db);
    return db.students[index];
};

export const apiDeleteStudent = async (nis: string): Promise<void> => {
    await delay(500);
    const db = getDb();
    db.students = db.students.filter((s: Student) => s.nis !== nis);
    saveDb(db);
};

export const apiImportStudents = async (students: Student[]): Promise<void> => {
    await delay(1000);
    const db = getDb();
    const existingNis = new Set(db.students.map((s: Student) => s.nis));
    const newStudents = students.filter(s => !existingNis.has(s.nis));
    db.students.push(...newStudents);
    saveDb(db);
};

// Exams
export const apiGetExams = async (): Promise<Exam[]> => {
    await delay(500);
    const db = getDb();
    return [...db.exams].sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
};

export const apiCreateExam = async (examData: Omit<Exam, 'id' | 'questionCount'>): Promise<Exam> => {
    await delay(500);
    const db = getDb();
    const newExam: Exam = {
        ...examData,
        id: `exam_${Date.now()}`,
        questionCount: 0,
        order: db.exams.length,
    };
    db.exams.push(newExam);
    saveDb(db);
    return newExam;
};

export const apiUpdateExam = async (examData: Exam): Promise<Exam> => {
    await delay(500);
    const db = getDb();
    const index = db.exams.findIndex((e: Exam) => e.id === examData.id);
    if (index === -1) throw new Error('Ujian tidak ditemukan.');
    db.exams[index] = { ...db.exams[index], ...examData };
    saveDb(db);
    return db.exams[index];
};

export const apiDeleteExam = async (examId: string): Promise<void> => {
    await delay(500);
    const db = getDb();
    db.exams = db.exams.filter((e: Exam) => e.id !== examId);
    db.questions = db.questions.filter((q: Question) => q.examId !== examId);
    saveDb(db);
};

export const apiUpdateExamsOrder = async (orderedExamIds: string[]): Promise<void> => {
    await delay(300);
    const db = getDb();
    db.exams.forEach((exam: Exam) => {
        const newOrder = orderedExamIds.indexOf(exam.id);
        exam.order = newOrder !== -1 ? newOrder : exam.order;
    });
    saveDb(db);
};


// Questions
const updateQuestionCount = (examId: string) => {
    const db = getDb();
    const count = db.questions.filter((q: Question) => q.examId === examId).length;
    const exam = db.exams.find((e: Exam) => e.id === examId);
    if (exam) {
        exam.questionCount = count;
        saveDb(db);
    }
};

export const apiGetQuestionsForExam = async (examId: string): Promise<Question[]> => {
    await delay(700);
    const db = getDb();
    return db.questions.filter((q: Question) => q.examId === examId);
};

export const apiCreateQuestion = async (examId: string, questionData: Omit<Question, 'id' | 'examId'>): Promise<Question> => {
    await delay(500);
    const db = getDb();
    const newQuestion: Question = {
        ...questionData,
        id: `q_${Date.now()}`,
        examId,
    };
    db.questions.push(newQuestion);
    updateQuestionCount(examId);
    saveDb(db);
    return newQuestion;
};

export const apiUpdateQuestion = async (questionData: Question): Promise<Question> => {
    await delay(500);
    const db = getDb();
    const index = db.questions.findIndex((q: Question) => q.id === questionData.id);
    if (index === -1) throw new Error('Soal tidak ditemukan.');
    db.questions[index] = { ...db.questions[index], ...questionData };
    saveDb(db);
    return db.questions[index];
};

export const apiDeleteQuestion = async (questionId: string): Promise<void> => {
    await delay(500);
    const db = getDb();
    const question = db.questions.find((q: Question) => q.id === questionId);
    if (question) {
        db.questions = db.questions.filter((q: Question) => q.id !== questionId);
        updateQuestionCount(question.examId);
        saveDb(db);
    }
};

export const apiImportQuestions = async (examId: string, questions: Omit<Question, 'id' | 'examId'>[]): Promise<void> => {
    await delay(1000);
    const db = getDb();
    const newQuestions: Question[] = questions.map(q => ({
        ...q,
        id: `q_${Date.now()}_${Math.random()}`,
        examId,
    }));
    db.questions.push(...newQuestions);
    updateQuestionCount(examId);
    saveDb(db);
};

// Student Experience
export const apiGetExamsForStudent = async (studentId: string): Promise<Exam[]> => {
    return apiGetExams(); // For now, all students see all exams
};

export const apiGetResultsForStudent = async (studentId: string): Promise<ExamResult[]> => {
    await delay(500);
    const db = getDb();
    return db.results.filter((r: ExamResult) => r.nis === studentId);
};

const calculateScore = (questions: Question[], answers: Answer[]): number => {
    let correct = 0;
    const scorableQuestions = questions.filter(q => q.type !== QuestionType.ESSAY && q.type !== QuestionType.SURVEY);

    if (scorableQuestions.length === 0) return 100; // or 0, depending on policy

    answers.forEach(answer => {
        const question = questions.find(q => q.id === answer.questionId);
        if (!question || !question.correctAnswer) return;

        let isCorrect = false;
        switch (question.type) {
            case QuestionType.SINGLE_CHOICE:
            case QuestionType.SHORT_ANSWER:
                isCorrect = String(answer.value).toLowerCase() === String(question.correctAnswer).toLowerCase();
                break;
            case QuestionType.MULTIPLE_CHOICE_COMPLEX:
                const correctIds = (question.correctAnswer as string[]).sort();
                const studentIds = (answer.value as string[] || []).sort();
                isCorrect = JSON.stringify(correctIds) === JSON.stringify(studentIds);
                break;
            case QuestionType.MATCHING:
                 const correctMatching = question.correctAnswer as Record<string, string>;
                 const studentMatching = answer.value as Record<string, string>;
                 isCorrect = Object.keys(correctMatching).length > 0 && 
                             Object.keys(correctMatching).every(key => correctMatching[key] === studentMatching[key]);
                 break;
        }
        if (isCorrect) correct++;
    });

    return Math.round((correct / scorableQuestions.length) * 100);
};

export const apiSubmitAnswers = async (studentId: string, examId: string, answers: Answer[]): Promise<void> => {
    await delay(1000);
    const db = getDb();
    const student = db.students.find((s: Student) => s.nis === studentId);
    const exam = db.exams.find((e: Exam) => e.id === examId);
    if (!student || !exam) throw new Error("Data siswa atau ujian tidak valid.");

    const questions = db.questions.filter((q: Question) => q.examId === examId);
    const score = calculateScore(questions, answers);

    const newResult: ExamResult = {
        nis: student.nis,
        name: student.name,
        class: student.class,
        examId: exam.id,
        examName: exam.name,
        score,
        submittedAt: new Date(),
    };

    db.results.push(newResult);
    // You'd also update student status here
    saveDb(db);
};

// Admin Dashboard
export const apiGetMonitoringData = async (): Promise<MonitoredStudent[]> => {
    await delay(300);
    // This is a simplified mock. A real implementation would track login/exam start/finish events.
    const db = getDb();
    const resultsByNis = new Map(db.results.map((r: ExamResult) => [`${r.nis}-${r.examId}`, r]));
    
    return db.students.map((s: Student) => {
        // A simple logic: if any result exists, they are finished. Otherwise, not started.
        const hasAnyResult = db.results.some((r: ExamResult) => r.nis === s.nis);
        return {
            nis: s.nis,
            name: s.name,
            class: s.class,
            status: hasAnyResult ? StudentExamStatus.FINISHED : StudentExamStatus.NOT_STARTED,
        };
    });
};

export const apiGetExamResults = async (): Promise<ExamResult[]> => {
    await delay(800);
    const db = getDb();
    return [...db.results];
};

export const apiUpdateAdminProfile = async (adminId: string, name: string, password?: string): Promise<User> => {
    await delay(500);
    const db = getDb();
    const admin = db.admins.find((a: any) => a.id === adminId);
    if (!admin) throw new Error('Admin tidak ditemukan.');
    
    admin.name = name;
    if (password) {
        admin.password = password;
    }
    saveDb(db);
    return { ...admin };
};

export const apiResetAdminPassword = async (adminId: string): Promise<void> => {
    await delay(500);
    const db = getDb();
    const admin = db.admins.find((a: any) => a.id === adminId);
    if (!admin) throw new Error('Admin tidak ditemukan.');
    admin.password = 'admin123';
    saveDb(db);
};


// Settings
export const apiGetExamSettings = async (): Promise<ExamSettings> => {
    await delay(300);
    const db = getDb();
    return db.settings;
};

export const apiSaveExamSettings = async (settings: ExamSettings): Promise<ExamSettings> => {
    await delay(500);
    const db = getDb();
    db.settings = settings;
    saveDb(db);
    return settings;
};
