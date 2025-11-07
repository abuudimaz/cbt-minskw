
import React from 'react';
import { Question } from '../../types';

interface QuestionViewerProps {
    question: Question;
    selectedAnswer?: string;
    onSelectAnswer: (questionId: string, optionId: string) => void;
}

const QuestionViewer: React.FC<QuestionViewerProps> = ({ question, selectedAnswer, onSelectAnswer }) => {
    return (
        <div>
            <p className="text-lg text-gray-800 leading-relaxed mb-6">{question.questionText}</p>
            <div className="space-y-4">
                {question.options.map(option => (
                    <label 
                        key={option.id} 
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedAnswer === option.id 
                                ? 'bg-brand-blue-dark border-brand-blue-dark text-white shadow-lg' 
                                : 'bg-white border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        <input
                            type="radio"
                            name={question.id}
                            value={option.id}
                            checked={selectedAnswer === option.id}
                            onChange={() => onSelectAnswer(question.id, option.id)}
                            className="hidden"
                        />
                        <span className={`w-6 h-6 mr-4 flex-shrink-0 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswer === option.id ? 'border-white' : 'border-gray-400'
                        }`}>
                            {selectedAnswer === option.id && <span className="w-3 h-3 bg-white rounded-full"></span>}
                        </span>
                        <span>{option.text}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default QuestionViewer;
