import React, { useState, useEffect, useCallback } from 'react';
import { Exam, Question, Answer, ExamSettings } from '../../types';
import { apiGetQuestionsForExam, apiSubmitAnswers, apiGetExamSettings } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../shared/LoadingSpinner';
import Button from '../shared/Button';
import { formatTime } from '../../utils/helpers';
import QuestionViewer from './QuestionViewer';
import ExamSummary from './ExamSummary';
import { toastError } from '../../utils/helpers';
import QuestionNavigationPanel from './QuestionNavigationPanel';
import { FlagIcon } from './StudentIcons';

interface ExamInterfaceProps {
    exam: Exam;
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({ exam }) => {
    const { user, finishExam } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [examSettings, setExamSettings] = useState<ExamSettings | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, any>>(new Map());
    const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [reviewedQuestions, setReviewedQuestions] = useState<Set<string>>(new Set());
    const [isNavPanelVisible, setIsNavPanelVisible] = useState(false);

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

    const handleConfirmSubmit = () => {
        const unreviewedCount = Array.from(reviewedQuestions).filter(id => {
            const qIndex = questions.findIndex(q => q.id === id);
            return qIndex !== -1;
        }).length;

        const unansweredCount = questions.length - answers.size;

        let confirmationMessage = "Apakah Anda yakin ingin menyelesaikan ujian?";

        if (unansweredCount > 0) {
            confirmationMessage += `\nAnda memiliki ${unansweredCount} soal yang belum dijawab.`;
        }

        if (unreviewedCount > 0) {
            confirmationMessage += `\nAnda memiliki ${unreviewedCount} soal yang masih ditandai untuk ditinjau.`;
        }

        if (window.confirm(confirmationMessage)) {
            handleSubmit();
        }
    };


    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [fetchedQuestions, fetchedSettings] = await Promise.all([
                    apiGetQuestionsForExam(exam.id),
                    apiGetExamSettings()
                ]);
                setQuestions(fetchedQuestions);
                setExamSettings(fetchedSettings);
            } catch (error) {
                toastError("Gagal memuat data ujian.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
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
    
    const toggleReview = (questionId: string) => {
        setReviewedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };
    
    const jumpToQuestion = (index: number) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQuestionIndex(index);
        }
    };

    if (isLoading) return <LoadingSpinner text="Mempersiapkan soal..." />;
    
    if (isFinished) {
        return <ExamSummary onFinish={finishExam} />;
    }

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
    const isCurrentMarked = reviewedQuestions.has(currentQuestion.id);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mb-4 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{exam.name}</h2>
                    <p className="text-gray-500">Soal {currentQuestionIndex + 1} dari {questions.length}</p>
                </div>
                <div className="flex items-center space-x-4">
                     <Button 
                        variant="secondary"
                        onClick={() => setIsNavPanelVisible(prev => !prev)}
                        size="sm"
                    >
                        {isNavPanelVisible ? 'Tutup Daftar Soal' : 'Lihat Daftar Soal'}
                    </Button>
                    <div className="text-center">
                        <div className="text-sm text-gray-500">Sisa Waktu</div>
                        <div className={`text-2xl font-bold transition-colors ${timeLeft < 300 ? 'animate-pulse text-red-600' : 'text-red-500'}`}>{formatTime(timeLeft)}</div>
                    </div>
                </div>
            </div>

             {isNavPanelVisible && (
                <QuestionNavigationPanel
                    questions={questions}
                    currentIndex={currentQuestionIndex}
                    answers={answers}
                    reviewedQuestions={reviewedQuestions}
                    onJumpToQuestion={jumpToQuestion}
                />
            )}

            <div className={`bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4 transition-all ${isCurrentMarked ? 'ring-2 ring-yellow-500' : ''}`}>
                {currentQuestion && examSettings && (
                    <QuestionViewer 
                        question={currentQuestion}
                        selectedAnswer={answers.get(currentQuestion.id)}
                        onSelectAnswer={handleSelectAnswer}
                        settings={examSettings}
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
                
                <Button 
                    variant={'secondary'}
                    onClick={() => toggleReview(currentQuestion.id)}
                    className={isCurrentMarked ? 'ring-2 ring-yellow-500 bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                >
                    <FlagIcon filled={isCurrentMarked} />
                    <span className="ml-2">{isCurrentMarked ? 'Hapus Tanda' : 'Tandai Soal'}</span>
                </Button>
                
                {currentQuestionIndex === questions.length - 1 ? (
                    <Button 
                        variant="primary" 
                        onClick={handleConfirmSubmit}
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