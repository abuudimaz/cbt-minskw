import React, { useState, useEffect } from 'react';
import { ExamResult, Submission, Question, QuestionType, Answer } from '../../types';
import { apiGetSubmission, apiGetQuestionsForExam, apiUpdateExamResult } from '../../services/api';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Input from '../shared/Input';
import LoadingSpinner from '../shared/LoadingSpinner';
import { toastSuccess, toastError } from '../../utils/helpers';

interface ResultDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: ExamResult;
    onScoreUpdate: () => void;
}

const ResultDetailModal: React.FC<ResultDetailModalProps> = ({ isOpen, onClose, result, onScoreUpdate }) => {
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [finalScore, setFinalScore] = useState<number>(result.score);
    const [visibleAnswers, setVisibleAnswers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setIsLoading(true);
                setError('');
                setVisibleAnswers(new Set()); // Reset visible answers on open
                try {
                    const [submissionData, questionsData] = await Promise.all([
                        apiGetSubmission(result.nis, result.examId),
                        apiGetQuestionsForExam(result.examId)
                    ]);
                    if (!submissionData) {
                        throw new Error("Data jawaban siswa tidak ditemukan.");
                    }
                    setSubmission(submissionData);
                    setQuestions(questionsData);
                    setFinalScore(result.score);
                } catch (err: any) {
                    setError(err.message || 'Gagal memuat data detail.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen, result]);
    
    const handleSaveFinalScore = async () => {
        setIsLoading(true);
        try {
            await apiUpdateExamResult(result.id, finalScore);
            toastSuccess('Nilai akhir berhasil disimpan.');
            onScoreUpdate();
        } catch(err) {
            toastError('Gagal menyimpan nilai akhir.');
        } finally {
            setIsLoading(false);
        }
    };

    const findAnswer = (questionId: string): Answer | undefined => {
        return submission?.answers.find(a => a.questionId === questionId);
    };

    const toggleAnswerVisibility = (questionId: string) => {
        setVisibleAnswers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const renderAnswer = (question: Question, answer: Answer | undefined) => {
        const value = answer?.value;

        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
            return <p className="text-gray-500 italic">Tidak dijawab</p>;
        }
        
        switch (question.type) {
            case QuestionType.SINGLE_CHOICE: {
                const selectedOption = question.options?.find(opt => opt.id === value);
                return <p>{selectedOption?.text || 'Jawaban tidak valid'}</p>;
            }
            case QuestionType.MULTIPLE_CHOICE_COMPLEX: {
                const selectedOptions = question.options?.filter(opt => (value as string[]).includes(opt.id));
                if (!selectedOptions || selectedOptions.length === 0) return <p className="text-gray-500 italic">Tidak dijawab</p>;
                return <ul className="list-disc list-inside">{selectedOptions.map(opt => <li key={opt.id}>{opt.text}</li>)}</ul>;
            }
            case QuestionType.MATCHING: {
                const answerMap = value as Record<string, string>;
                return (
                    <ul className="list-none space-y-1">
                        {question.matchingPrompts?.map(prompt => {
                            const answerId = answerMap[prompt.id];
                            const answerText = question.matchingAnswers?.find(ans => ans.id === answerId)?.text || <span className="italic text-gray-500">Kosong</span>;
                            return <li key={prompt.id}><span className="font-medium">{prompt.text}</span> &rarr; {answerText}</li>
                        })}
                    </ul>
                );
            }
            case QuestionType.SHORT_ANSWER:
                return <p className="font-mono p-1 bg-gray-100 inline-block rounded">{value}</p>;

            case QuestionType.ESSAY:
                return <p className="p-2 bg-gray-50 border rounded-md whitespace-pre-wrap">{value}</p>;

            default:
                return <p className="text-gray-700">{JSON.stringify(value)}</p>;
        }
    };

    const renderCorrectAnswer = (question: Question) => {
        const correctAnswer = question.correctAnswer;
        if (correctAnswer === undefined || correctAnswer === null || (Array.isArray(correctAnswer) && correctAnswer.length === 0)) {
             return <p className="text-gray-500 italic">Kunci jawaban tidak diatur</p>;
        }
        if (question.type === QuestionType.ESSAY || question.type === QuestionType.SURVEY) {
             return null;
        }
        const answerForRenderer: Answer | undefined = { questionId: question.id, value: correctAnswer };
        return renderAnswer(question, answerForRenderer);
    };

    const isAnswerCorrect = (question: Question, answer: Answer | undefined): boolean | null => {
        if(question.type === QuestionType.ESSAY || question.type === QuestionType.SURVEY) return null;
        if(!answer || answer.value === undefined) return false;
        return JSON.stringify(answer.value) === JSON.stringify(question.correctAnswer);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detail Jawaban - ${result.name}`} size="xl">
            {isLoading && <LoadingSpinner />}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && submission && (
                <div className="space-y-6">
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {questions.map((q, index) => {
                            const studentAnswer = findAnswer(q.id);
                            const isCorrect = isAnswerCorrect(q, studentAnswer);
                            const isKeyVisible = visibleAnswers.has(q.id);
                            
                            let borderColor = 'border-gray-200';
                            if(isCorrect === true) borderColor = 'border-green-400';
                            if(isCorrect === false) borderColor = 'border-red-400';

                            return (
                                <div key={q.id} className={`pb-4 pt-2 px-3 border-l-4 ${borderColor}`}>
                                    <div className="flex justify-between items-start gap-4">
                                        <p className="font-semibold text-gray-800 flex-1">{index + 1}. {q.questionText}</p>
                                        {q.type !== QuestionType.ESSAY && q.type !== QuestionType.SURVEY && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => toggleAnswerVisibility(q.id)}
                                                className="flex-shrink-0"
                                            >
                                                {isKeyVisible ? 'Sembunyikan Kunci' : 'Lihat Kunci'}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-600 mb-1 flex items-center">
                                                Jawaban Siswa: 
                                                {isCorrect === true && <span className="ml-2 text-green-600">✅ Benar</span>}
                                                {isCorrect === false && <span className="ml-2 text-red-600">❌ Salah</span>}
                                            </h4>
                                            {renderAnswer(q, studentAnswer)}
                                        </div>
                                        {isKeyVisible && (
                                            <div className="bg-green-50 p-2 rounded-md border border-green-200">
                                                <h4 className="text-sm font-bold text-green-700 mb-1">Kunci Jawaban:</h4>
                                                {renderCorrectAnswer(q)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-end gap-4 bg-gray-50 -m-6 p-6 rounded-b-lg">
                        <div className="flex items-center gap-2">
                            <label htmlFor="finalScore" className="font-semibold text-gray-700">Koreksi & Nilai Akhir:</label>
                            <Input
                                id="finalScore"
                                type="number"
                                value={finalScore}
                                onChange={(e) => setFinalScore(parseInt(e.target.value) > 100 ? 100 : parseInt(e.target.value) < 0 ? 0 : parseInt(e.target.value))}
                                className="w-24 font-bold text-lg"
                                max={100}
                                min={0}
                            />
                        </div>
                        <Button onClick={handleSaveFinalScore} isLoading={isLoading}>
                            Simpan Nilai Akhir
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ResultDetailModal;