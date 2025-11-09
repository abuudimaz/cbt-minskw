import { 
    User, Role, Student, Exam, Question, Answer, ExamResult, MonitoredStudent,
    StudentExamStatus, Submission, ExamSettings, QuestionType
} from '../types';

// --- MOCK DATABASE using localStorage ---

const DB = {
    users: 'cbt_db_users',
    exams: 'cbt_db_exams',
    questions: 'cbt_db_questions',
    submissions: 'cbt_db_submissions',
    settings: 'cbt_db_settings',
    monitoring: 'cbt_db_monitoring',
};

const initDB = () => {
    if (!localStorage.getItem(DB.users)) {
        localStorage.setItem(DB.users, JSON.stringify([
            { id: 'admin', name: 'Admin Proktor', role: Role.ADMIN, password: 'admin123' },
            { id: '1234', nis: '1234', name: 'Budi Santoso', class: 'VI A', room: 'RUANG 1', role: Role.STUDENT, password: '1234' },
        ]));
    }
    if (!localStorage.getItem(DB.exams)) {
        localStorage.setItem(DB.exams, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB.questions)) {
        localStorage.setItem(DB.questions, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB.submissions)) {
        localStorage.setItem(DB.submissions, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB.settings)) {
         localStorage.setItem(DB.settings, JSON.stringify({
            assessmentTitle: 'ASESMEN MADRASAH (AM) BERBASIS KOMPUTER',
            academicYear: '2023/2024',
            proctorName: 'Nama Proktor',
            headmasterName: 'Nama Kepala Sekolah, S.Pd.',
            headmasterNip: '19... .... ....',
            questionDisplay: 'single',
            multipleChoiceComplexStyle: 'checkbox', // Default value
         }));
    }
     if (!localStorage.getItem(DB.monitoring)) {
        localStorage.setItem(DB.monitoring, JSON.stringify([]));
    }
};

initDB();

const get = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const getOne = <T>(key: string): T | null => JSON.parse(localStorage.getItem(key) || 'null');
const set = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


// --- AUTH ---
export const apiStudentLogin = async (nis: string, password: string): Promise<User | null> => {
    await delay(500);
    const users = get<any>(DB.users);

    const trimmedNis = nis.trim();
    const trimmedPassword = password.trim();

    // Do not allow login with empty credentials
    if (trimmedNis === '' || trimmedPassword === '') {
        return null;
    }

    const user = users.find(u => {
        // A single, comprehensive check for a valid, matching student record.
        return u.role === Role.STUDENT &&
               u.nis != null &&
               u.password != null &&
               String(u.nis).trim().toLowerCase() === trimmedNis.toLowerCase() &&
               String(u.password).trim() === trimmedPassword;
    });

    if (user) {
        updateMonitoringStatus(user.nis, StudentExamStatus.NOT_STARTED);
        return { id: user.nis, name: user.name, role: Role.STUDENT, nis: user.nis, class: user.class, room: user.room };
    }
    
    return null;
};


export const apiAdminLogin = async (username: string, password: string): Promise<User | null> => {
    await delay(500);
    const users = get<any>(DB.users);
    const user = users.find(u => u.role === Role.ADMIN && u.id === username && u.password === password);
    if (user) return { id: user.id, name: user.name, role: Role.ADMIN };
    return null;
};

// --- STUDENTS ---
export const apiGetStudents = async (): Promise<Student[]> => {
    await delay(300);
    const users = get<any>(DB.users);
    return users.filter(u => u.role === Role.STUDENT).map(({password, ...student}) => student);
};

export const apiCreateStudent = async (studentData: Student): Promise<Student> => {
    await delay(300);
    const users = get<any>(DB.users);
    if (users.some(u => u.nis === studentData.nis)) throw new Error("NIS sudah ada.");
    users.push({ ...studentData, id: studentData.nis, role: Role.STUDENT });
    set(DB.users, users);
    return studentData;
};

export const apiUpdateStudent = async (studentData: Student): Promise<Student> => {
    await delay(300);
    let users = get<any>(DB.users);
    users = users.map(u => {
        if (u.nis === studentData.nis) {
            const updatedUser = { ...u, name: studentData.name, class: studentData.class, room: studentData.room };
            if (studentData.password) {
                updatedUser.password = studentData.password;
            }
            return updatedUser;
        }
        return u;
    });
    set(DB.users, users);
    return studentData;
};

export const apiDeleteStudent = async (nis: string): Promise<void> => {
    await delay(300);
    let users = get<any>(DB.users);
    users = users.filter(u => u.nis !== nis);
    set(DB.users, users);
};

export const apiDeleteStudents = async (nisList: string[]): Promise<void> => {
    await delay(500);
    let users = get<any>(DB.users);
    const nisSet = new Set(nisList);
    // Only filter students. Admins should not be affected even if their id somehow matched.
    users = users.filter(u => u.role !== Role.STUDENT || !nisSet.has(u.nis));
    set(DB.users, users);
};

export const apiImportStudents = async (importedStudents: Student[]): Promise<{ added: number, skipped: number }> => {
    await delay(1000);
    const users = get<any>(DB.users);
    const existingNis = new Set(users.map(u => u.nis));
    let added = 0, skipped = 0;
    
    importedStudents.forEach(s => {
        if(existingNis.has(s.nis)) {
            skipped++;
        } else {
            users.push({ ...s, id: s.nis, role: Role.STUDENT });
            added++;
        }
    });

    set(DB.users, users);
    return { added, skipped };
};

// --- EXAMS ---
export const apiGetExams = async (): Promise<Exam[]> => {
    await delay(300);
    const exams = get<Exam>(DB.exams);
    const questions = get<Question>(DB.questions);
    return exams.map(exam => ({
        ...exam,
        questionCount: questions.filter(q => q.examId === exam.id).length
    }));
};
export const apiGetExamsForStudent = apiGetExams;

export const apiCreateExam = async (examData: Omit<Exam, 'id' | 'questionCount'>): Promise<Exam> => {
    await delay(300);
    const exams = get<Exam>(DB.exams);
    const newExam = { ...examData, id: `exam_${Date.now()}`, questionCount: 0 };
    exams.push(newExam);
    set(DB.exams, exams);
    return newExam;
};

export const apiUpdateExam = async (examData: Exam): Promise<Exam> => {
    await delay(300);
    let exams = get<Exam>(DB.exams);
    exams = exams.map(e => (e.id === examData.id ? { ...e, ...examData } : e));
    set(DB.exams, exams);
    return examData;
};

export const apiDeleteExam = async (examId: string): Promise<void> => {
    await delay(300);
    let exams = get<Exam>(DB.exams);
    exams = exams.filter(e => e.id !== examId);
    set(DB.exams, exams);
    // Also delete questions
    let questions = get<Question>(DB.questions);
    questions = questions.filter(q => q.examId !== examId);
    set(DB.questions, questions);
};

export const apiUpdateExamsOrder = async (orderedExamIds: string[]): Promise<void> => {
    await delay(200);
    const exams = get<Exam>(DB.exams);
    const orderedExams = orderedExamIds.map(id => exams.find(e => e.id === id)).filter(Boolean) as Exam[];
    set(DB.exams, orderedExams);
};


// --- QUESTIONS ---
export const apiGetQuestionsForExam = async (examId: string): Promise<Question[]> => {
    await delay(500);
    const questions = get<Question>(DB.questions);
    return questions.filter(q => q.examId === examId);
};

export const apiCreateQuestion = async (examId: string, questionData: Omit<Question, 'id' | 'examId'>): Promise<Question> => {
    await delay(300);
    const questions = get<Question>(DB.questions);
    const newQuestion = { ...questionData, id: `q_${Date.now()}`, examId };
    questions.push(newQuestion);
    set(DB.questions, questions);
    return newQuestion;
};

export const apiUpdateQuestion = async (questionData: Question): Promise<Question> => {
    await delay(300);
    let questions = get<Question>(DB.questions);
    questions = questions.map(q => q.id === questionData.id ? questionData : q);
    set(DB.questions, questions);
    return questionData;
};

export const apiDeleteQuestion = async (questionId: string): Promise<void> => {
    await delay(300);
    let questions = get<Question>(DB.questions);
    questions = questions.filter(q => q.id !== questionId);
    set(DB.questions, questions);
};

export const apiImportQuestions = async (examId: string, importedQuestions: Omit<Question, 'id' | 'examId'>[]): Promise<void> => {
    await delay(1000);
    const questions = get<Question>(DB.questions);
    const newQuestions = importedQuestions.map(q => ({
        ...q,
        id: `q_${Date.now()}_${Math.random()}`,
        examId,
        // Make sure options have IDs if they are choice-based
        options: (q.type === QuestionType.SINGLE_CHOICE || q.type === QuestionType.MULTIPLE_CHOICE_COMPLEX) 
            ? q.options?.map((opt, i) => ({ ...opt, id: opt.id || `opt${i+1}` })) 
            : q.options,
    }));
    set(DB.questions, [...questions, ...newQuestions]);
};


// --- SUBMISSIONS & RESULTS ---
const calculateScore = (questions: Question[], answers: Answer[]): number => {
    let correct = 0;
    const choiceQuestions = questions.filter(q => q.type === QuestionType.SINGLE_CHOICE || q.type === QuestionType.MULTIPLE_CHOICE_COMPLEX || q.type === QuestionType.SHORT_ANSWER);
    if(choiceQuestions.length === 0) return 100; // if no questions to grade, give 100.

    answers.forEach(ans => {
        const question = questions.find(q => q.id === ans.questionId);
        if (question && question.correctAnswer) {
            if(JSON.stringify(ans.value) === JSON.stringify(question.correctAnswer)) {
                correct++;
            }
        }
    });

    return Math.round((correct / choiceQuestions.length) * 100);
}

export const apiSubmitAnswers = async (studentId: string, examId: string, answers: Answer[]): Promise<Submission> => {
    await delay(1000);
    updateMonitoringStatus(studentId, StudentExamStatus.FINISHED);
    const submissions = get<Submission>(DB.submissions);
    const questions = await apiGetQuestionsForExam(examId);
    const score = calculateScore(questions, answers);

    const newSubmission: Submission = {
        id: `sub_${studentId}_${examId}`,
        studentId, examId, answers,
        submittedAt: new Date().toISOString(),
        score,
    };
    
    // Avoid duplicate submissions
    const existingIndex = submissions.findIndex(s => s.id === newSubmission.id);
    if(existingIndex > -1) {
        submissions[existingIndex] = newSubmission;
    } else {
        submissions.push(newSubmission);
    }
    set(DB.submissions, submissions);
    return newSubmission;
};

export const apiGetResultsForStudent = async (studentId: string): Promise<ExamResult[]> => {
    await delay(300);
    const submissions = get<Submission>(DB.submissions).filter(s => s.studentId === studentId);
    const exams = get<Exam>(DB.exams);
    const student = (get<any>(DB.users)).find(u => u.nis === studentId);

    return submissions.map(sub => {
        const exam = exams.find(e => e.id === sub.examId);
        return {
            id: sub.id,
            nis: sub.studentId,
            name: student?.name || '',
            class: student?.class || '',
            examId: sub.examId,
            examName: exam?.name || 'Unknown Exam',
            score: sub.score ?? 0,
            submittedAt: sub.submittedAt
        };
    });
};

export const apiGetExamResults = async (): Promise<ExamResult[]> => {
    await delay(800);
    const submissions = get<Submission>(DB.submissions);
    const exams = get<Exam>(DB.exams);
    const students = await apiGetStudents();

    const results = submissions.map(sub => {
        const student = students.find(s => s.nis === sub.studentId);
        const exam = exams.find(e => e.id === sub.examId);

        return {
            id: sub.id,
            nis: sub.studentId,
            name: student?.name || 'Unknown Student',
            class: student?.class || '-',
            examId: sub.examId,
            examName: exam?.name || 'Unknown Exam',
            score: sub.score ?? 0,
            submittedAt: sub.submittedAt
        };
    });
    return results.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
};

export const apiGetSubmission = async (studentNis: string, examId: string): Promise<Submission | null> => {
    await delay(400);
    const submissions = get<Submission>(DB.submissions);
    return submissions.find(s => s.studentId === studentNis && s.examId === examId) || null;
};

export const apiUpdateExamResult = async(resultId: string, score: number): Promise<void> => {
    await delay(500);
    let submissions = get<Submission>(DB.submissions);
    const submissionIndex = submissions.findIndex(s => s.id === resultId);
    if (submissionIndex > -1) {
        submissions[submissionIndex].score = score;
        set(DB.submissions, submissions);
    } else {
        throw new Error("Submission not found");
    }
};


// --- MONITORING ---
const updateMonitoringStatus = (nis: string, status: StudentExamStatus) => {
    let monitoringData = get<MonitoredStudent>(DB.monitoring);
    const studentIndex = monitoringData.findIndex(s => s.nis === nis);
    if(studentIndex > -1) {
        monitoringData[studentIndex].status = status;
    } else {
         const users = get<any>(DB.users);
         const studentInfo = users.find(u => u.nis === nis);
         if(studentInfo) {
             monitoringData.push({
                 nis,
                 name: studentInfo.name,
                 class: studentInfo.class,
                 status
             });
         }
    }
    set(DB.monitoring, monitoringData);
};

export const apiGetMonitoringData = async (): Promise<MonitoredStudent[]> => {
    await delay(200);
    const students = await apiGetStudents();
    let monitoringData = get<MonitoredStudent>(DB.monitoring);
    
    // Add any missing students to monitoring data with status NOT_STARTED
    students.forEach(s => {
        if (!monitoringData.some(m => m.nis === s.nis)) {
            monitoringData.push({
                nis: s.nis,
                name: s.name,
                class: s.class,
                status: StudentExamStatus.NOT_STARTED,
            });
        }
    });

    set(DB.monitoring, monitoringData);
    return monitoringData;
};


// --- ADMIN & SETTINGS ---
export const apiUpdateAdminProfile = async (adminId: string, name: string, password?: string): Promise<User> => {
    await delay(500);
    let users = get<any>(DB.users);
    let updatedUser: User | null = null;
    users = users.map(u => {
        if(u.id === adminId && u.role === Role.ADMIN) {
            const newUser = { ...u, name };
            if(password) newUser.password = password;
            updatedUser = newUser;
            return newUser;
        }
        return u;
    });
    set(DB.users, users);
    if(!updatedUser) throw new Error("Admin not found");
    return { id: updatedUser.id, name: updatedUser.name, role: updatedUser.role };
};

export const apiResetAdminPassword = async (adminId: string): Promise<void> => {
    await delay(500);
    let users = get<any>(DB.users);
    users = users.map(u => {
        if(u.id === adminId && u.role === Role.ADMIN) {
            return { ...u, password: 'admin123' };
        }
        return u;
    });
    set(DB.users, users);
};

export const apiGetExamSettings = async (): Promise<ExamSettings> => {
    await delay(200);
    const settings = getOne<ExamSettings>(DB.settings);
    // Add default for the new setting if it doesn't exist
    if (settings && typeof settings.multipleChoiceComplexStyle === 'undefined') {
        settings.multipleChoiceComplexStyle = 'checkbox';
    }
    return settings as ExamSettings;
};

export const apiUpdateExamSettings = async (settings: ExamSettings): Promise<ExamSettings> => {
    await delay(400);
    set(DB.settings, settings);
    return settings;
};