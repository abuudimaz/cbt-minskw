import React from 'react';
import { Question, QuestionType, ExamSettings } from '../../types';
import Input from '../shared/Input';

interface QuestionViewerProps {
    question: Question;
    selectedAnswer?: any;
    onSelectAnswer: (questionId: string, value: any) => void;
    settings: ExamSettings;
}

const TextWithArabic: React.FC<{ text: string }> = ({ text }) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    const containsArabic = arabicRegex.test(text);

    if (!containsArabic) {
        // For non-Arabic text, render it without special styling to use the default Poppins font.
        return <>{text}</>;
    }
    
    // Refined logic for mixed content:
    // The parent span sets the overall block direction (`dir="auto"`) and alignment (`rtl:text-right`).
    // This allows the browser to correctly handle the flow of mixed LTR and RTL text.
    return (
        <span dir="auto" className="text-xl block rtl:text-right">
            {
                // Split the string by capturing Arabic segments (including spaces and common punctuation).
                // This creates an array of alternating non-Arabic and Arabic parts.
                text.split(/([\u0600-\u06FF\s\p{P}]+)/u).filter(Boolean).map((part, index) => {
                    // Test if the current part is an Arabic segment.
                    if (arabicRegex.test(part)) {
                        // Apply the special Amiri font only to the Arabic parts.
                        return <span key={index} className="font-amiri">{part}</span>;
                    }
                    // Render non-Arabic parts with the default font (Poppins).
                    return <span key={index}>{part}</span>;
                })
            }
        </span>
    );
};


// A small component to render the option image consistently.
const OptionImage: React.FC<{ imageUrl?: string; altText: string }> = ({ imageUrl, altText }) => {
    if (!imageUrl) {
        return null;
    }
    return <img src={imageUrl} alt={altText} className="mt-2 rounded-md max-w-sm max-h-64 object-contain" />;
};


const QuestionViewer: React.FC<QuestionViewerProps> = ({ question, selectedAnswer, onSelectAnswer, settings }) => {

    const renderAnswerInput = () => {
        switch (question.type) {
            case QuestionType.SINGLE_CHOICE:
                return (
                    <div className="space-y-3">
                        {question.options?.map((option, index) => (
                            <div key={option.id}
                                 onClick={() => onSelectAnswer(question.id, option.id)}
                                 className={`p-4 border rounded-lg cursor-pointer transition-colors flex items-start
                                    ${selectedAnswer === option.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-300 hover:bg-gray-100'}`}
                            >
                                <span className={`font-bold mr-3`}>{String.fromCharCode(65 + index)}.</span>
                                <div className="flex-1">
                                    <TextWithArabic text={option.text} />
                                    <OptionImage imageUrl={option.optionImageUrl} altText={`Opsi ${index + 1}`} />
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
                
                const style = settings.multipleChoiceComplexStyle || 'checkbox'; // Fallback to checkbox
                
                return (
                    <div className="space-y-3">
                         {question.options?.map((option, index) => {
                            const isChecked = selectedAnswer?.includes(option.id);
                            const baseClasses = "p-4 border rounded-lg cursor-pointer transition-colors flex items-start";
                            const selectedClasses = "border-blue-500 bg-blue-50 ring-2 ring-blue-500";
                            const unselectedClasses = "border-gray-300 hover:bg-gray-100";

                            return (
                                <div key={option.id}
                                     onClick={() => handleComplexChange(option.id)}
                                     className={`${baseClasses} ${isChecked ? selectedClasses : unselectedClasses}`}
                                >
                                    {style === 'checkbox' && (
                                         <input type="checkbox" checked={!!isChecked} readOnly className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3 mt-1" />
                                    )}
                                    {style === 'toggle' && (
                                         <span className={`font-bold mr-3`}>{String.fromCharCode(65 + index)}.</span>
                                    )}
                                    <div className="flex-1">
                                        <TextWithArabic text={option.text} />
                                        <OptionImage imageUrl={option.optionImageUrl} altText={`Opsi ${index + 1}`} />
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