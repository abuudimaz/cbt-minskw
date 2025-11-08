import React, { useState, useEffect, useCallback } from 'react';
import { Exam, Question, Answer } from '../../types';
import { apiGetQuestionsForExam, apiSubmitAnswers } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../shared/LoadingSpinner';
import Button from '../shared/Button';
import { formatTime } from '../../utils/helpers';
import QuestionViewer from './QuestionViewer';
import ExamSummary from './ExamSummary';
import { toastError } from '../../utils/helpers';

interface ExamInterfaceProps {
    exam: Exam;
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({ exam }) => {
    const { user, finishExam } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, any>>(new Map());
    const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!user) return;
        setIsSubmitting(true);
        const finalAnswers: Answer[] = Array.from(answers.entries()).map(([questionId, value]) => ({
            questionId,
            value,
        }));
        try {
            await apiSubmitAnswers(user.id, exam.id, finalAnswers);
            setIsFinished(true);
        } catch (error) {
            toastError("Gagal mengirim jawaban. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    }, [user, exam.id, answers]);


    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            const fetchedQuestions = await apiGetQuestionsForExam(exam.id);
            setQuestions(fetchedQuestions);
            setIsLoading(false);
        };
        fetchQuestions();
    }, [exam.id]);
    
    useEffect(() => {
        if (isLoading || isFinished) return;
        
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isLoading, isFinished, handleSubmit]);


    const handleSelectAnswer = (questionId: string, value: any) => {
        setAnswers(prev => new Map(prev).set(questionId, value));
    };

    const handleNavigation = (direction: 'next' | 'prev') => {
        if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else if (direction === 'prev' && currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (isLoading) return <LoadingSpinner text="Mempersiapkan soal..." />;
    
    if (isFinished) {
        return <ExamSummary onFinish={finishExam} />;
    }

    // Handle case where there are no questions for the exam
    if (questions.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800">Ujian Tidak Memiliki Soal</h2>
                <p className="text-gray-600 mt-2 mb-6">
                    Tidak ada soal yang ditemukan untuk asesmen ini. Silakan hubungi proktor atau guru Anda.
                </p>
                <Button onClick={finishExam}>
                    Kembali ke Dashboard
                </Button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mb-4 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{exam.name}</h2>
                    <p className="text-gray-500">Soal {currentQuestionIndex + 1} dari {questions.length}</p>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-500">Sisa Waktu</div>
                    <div className={`text-2xl font-bold transition-colors ${timeLeft < 300 ? 'animate-pulse text-red-600' : 'text-red-500'}`}>{formatTime(timeLeft)}</div>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
                {currentQuestion && (
                    <QuestionViewer 
                        question={currentQuestion}
                        selectedAnswer={answers.get(currentQuestion.id)}
                        onSelectAnswer={handleSelectAnswer}
                    />
                )}
            </div>

            <div className="mt-6 flex justify-between items-center">
                <Button 
                    variant="secondary"
                    onClick={() => handleNavigation('prev')}
                    disabled={currentQuestionIndex === 0}
                >
                    &larr; Sebelumnya
                </Button>
                
                {currentQuestionIndex === questions.length - 1 ? (
                    <Button 
                        variant="primary" 
                        onClick={() => {
                            if(window.confirm("Apakah Anda yakin ingin menyelesaikan ujian?")) {
                                handleSubmit();
                            }
                        }}
                        isLoading={isSubmitting}
                    >
                        Kumpulkan Jawaban
                    </Button>
                ) : (
                    <Button 
                        variant="primary"
                        onClick={() => handleNavigation('next')}
                    >
                        Berikutnya &rarr;
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ExamInterface;