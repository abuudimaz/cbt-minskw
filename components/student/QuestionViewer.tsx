import React from 'react';
import { Question, QuestionType } from '../../types';
import Input from '../shared/Input';

interface QuestionViewerProps {
    question: Question;
    selectedAnswer?: any;
    onSelectAnswer: (questionId: string, value: any) => void;
}

const TextWithArabic: React.FC<{ text: string }> = ({ text }) => {
    // Regex to detect if there's any Arabic character
    const arabicRegex = /[\u0600-\u06FF]/;
    if (!arabicRegex.test(text)) {
        return <>{text}</>; // No Arabic, return as is for performance
    }

    // Determine overall direction. If it contains any Latin characters, it's LTR. Otherwise, pure Arabic is RTL.
    const latinRegex = /[a-zA-Z]/;
    const overallDirection = latinRegex.test(text) ? 'ltr' : 'rtl';
    
    // Split the text into segments of Arabic and non-Arabic parts.
    // The regex captures segments of Arabic characters, spaces, and common punctuation, then we filter out empty strings.
    const parts = text.split(/([\u0600-\u06FF\s.,!؟]+)/g).filter(part => part);

    return (
        <span dir={overallDirection}>
            {parts.map((part, index) => {
                if (arabicRegex.test(part)) {
                    // This is an Arabic part, apply the Amiri font and specific styling
                    return <span key={index} className="font-amiri text-xl">{part}</span>;
                } else {
                    // This is a Latin/other script part, wrap in fragment to get a key
                    return <React.Fragment key={index}>{part}</React.Fragment>;
                }
            })}
        </span>
    );
};


const QuestionViewer: React.FC<QuestionViewerProps> = ({ question, selectedAnswer, onSelectAnswer }) => {

    const renderAnswerInput = () => {
        switch (question.type) {
            case QuestionType.SINGLE_CHOICE:
                return (
                    <div className="space-y-3">
                        {question.options?.map((option, index) => (
                            <div key={option.id}
                                 onClick={() => onSelectAnswer(question.id, option.id)}
                                 className={`p-4 border rounded-lg cursor-pointer transition-colors flex items-start text-left
                                    ${selectedAnswer === option.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-300 hover:bg-gray-100'}`}
                            >
                                <span className={`font-bold mr-3`}>{String.fromCharCode(65 + index)}.</span>
                                <div className="flex-1">
                                    <TextWithArabic text={option.text} />
                                    {option.optionImageUrl && <img src={option.optionImageUrl} alt={`Opsi ${index+1}`} className="mt-2 rounded-md max-w-xs" />}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            
            case QuestionType.MULTIPLE_CHOICE_COMPLEX:
                const handleComplexChange = (optionId: string) => {
                    const currentAnswers: string[] = selectedAnswer || [];
                    const newAnswers = currentAnswers.includes(optionId)
                        ? currentAnswers.filter(id => id !== optionId)
                        : [...currentAnswers, optionId];
                    onSelectAnswer(question.id, newAnswers);
                };
                return (
                    <div className="space-y-3">
                         {question.options?.map((option, index) => {
                            const isChecked = selectedAnswer?.includes(option.id);
                            return (
                                <div key={option.id}
                                     onClick={() => handleComplexChange(option.id)}
                                     className={`p-4 border rounded-lg cursor-pointer transition-colors flex items-start text-left
                                        ${isChecked ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-300 hover:bg-gray-100'}`}
                                >
                                    <input type="checkbox" checked={!!isChecked} readOnly className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3 mt-1" />
                                    <div className="flex-1">
                                        <TextWithArabic text={option.text} />
                                        {option.optionImageUrl && <img src={option.optionImageUrl} alt={`Opsi ${index+1}`} className="mt-2 rounded-md max-w-xs" />}
                                    </div>
                                </div>
                            );
                         })}
                    </div>
                );

            case QuestionType.MATCHING:
                const handleMatchingChange = (promptId: string, answerId: string) => {
                    const currentAnswers = selectedAnswer || {};
                    onSelectAnswer(question.id, { ...currentAnswers, [promptId]: answerId });
                };
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Prompts Column */}
                        <div className="space-y-4">
                             {question.matchingPrompts?.map(prompt => (
                                <div key={prompt.id} className="p-3 border rounded-md bg-gray-50 flex items-center justify-between">
                                    <TextWithArabic text={prompt.text} />
                                </div>
                             ))}
                        </div>
                        {/* Answers Column */}
                        <div className="space-y-4">
                             {question.matchingPrompts?.map(prompt => (
                                <select 
                                    key={prompt.id} 
                                    value={selectedAnswer?.[prompt.id] || ''}
                                    onChange={e => handleMatchingChange(prompt.id, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="" disabled>-- Pilih Pasangan --</option>
                                    {question.matchingAnswers?.map(answer => (
                                        <option key={answer.id} value={answer.id}>{answer.text}</option>
                                    ))}
                                </select>
                             ))}
                        </div>
                    </div>
                );

            case QuestionType.SHORT_ANSWER:
                return (
                    <Input 
                        type="text"
                        placeholder="Ketik jawaban singkat Anda di sini..."
                        value={selectedAnswer || ''}
                        onChange={e => onSelectAnswer(question.id, e.target.value)}
                    />
                );

            case QuestionType.ESSAY:
                return (
                    <textarea
                        placeholder="Ketik jawaban uraian Anda di sini..."
                        rows={6}
                        value={selectedAnswer || ''}
                        onChange={e => onSelectAnswer(question.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                );

            default:
                return <p>Tipe soal tidak didukung.</p>;
        }
    };


    return (
        <div>
            <div className="mb-6 prose max-w-none text-gray-800">
                <TextWithArabic text={question.questionText} />
            </div>

            {question.questionImageUrl && (
                <div className="mb-6">
                    <img src={question.questionImageUrl} alt="Ilustrasi Soal" className="max-w-full md:max-w-lg mx-auto rounded-lg shadow-md" />
                </div>
            )}
            
            {renderAnswerInput()}
        </div>
    );
};

export default QuestionViewer;