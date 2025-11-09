import React from 'react';
import { Question } from '../../types';

interface QuestionNavigationPanelProps {
    questions: Question[];
    currentIndex: number;
    answers: Map<string, any>;
    reviewedQuestions: Set<string>;
    onJumpToQuestion: (index: number) => void;
}

const QuestionNavigationPanel: React.FC<QuestionNavigationPanelProps> = ({
    questions,
    currentIndex,
    answers,
    reviewedQuestions,
    onJumpToQuestion,
}) => {
    return (
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Daftar Soal</h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {questions.map((question, index) => {
                    const isCurrent = index === currentIndex;
                    const isAnswered = answers.has(question.id) && answers.get(question.id) !== '' && (!Array.isArray(answers.get(question.id)) || (answers.get(question.id) as any[]).length > 0);
                    const isReviewed = reviewedQuestions.has(question.id);

                    let buttonClass = "w-full h-10 flex items-center justify-center rounded border-2 font-semibold transition-all duration-200 ";
                    
                    if (isCurrent) {
                        buttonClass += "bg-blue-600 text-white border-blue-700 ring-2 ring-offset-1 ring-blue-600 ";
                    } else if (isAnswered) {
                        buttonClass += "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 ";
                    } else {
                        buttonClass += "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 ";
                    }

                    if (isReviewed) {
                        buttonClass += "ring-2 ring-offset-1 ring-yellow-500 ";
                    }
                    
                    return (
                        <button
                            key={question.id}
                            onClick={() => onJumpToQuestion(index)}
                            className={buttonClass}
                            aria-label={`Pindah ke soal nomor ${index + 1}`}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>
             <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center"><span className="w-4 h-4 rounded bg-green-100 border-2 border-green-300 mr-2"></span> Sudah Dijawab</div>
                <div className="flex items-center"><span className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300 mr-2"></span> Belum Dijawab</div>
                <div className="flex items-center"><span className="w-4 h-4 rounded ring-2 ring-yellow-500 mr-2"></span> Ditandai</div>
                <div className="flex items-center"><span className="w-4 h-4 rounded bg-blue-600 border-2 border-blue-700 mr-2"></span> Soal Aktif</div>
            </div>
        </div>
    );
};

export default QuestionNavigationPanel;
