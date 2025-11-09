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
    // This regex helps identify if there are any Arabic characters in the text.
    const arabicRegex = /[\u0600-\u06FF]/;
    const containsArabic = arabicRegex.test(text);

    // For any text containing Arabic characters, we wrap it in a span that handles
    // bidirectional text automatically (`dir="auto"`). The browser will correctly
    // set the direction to right-to-left (RTL). We also apply specific styling
    // for RTL text to ensure it's right-aligned, and use the Amiri font for
    // better readability of Arabic script.
    if (containsArabic) {
        return (
            <span dir="auto" className="font-amiri text-xl block rtl:text-right">
                {text}
            </span>
        );
    }

    // For text without Arabic characters, we render it normally with a consistent
    // font size, inheriting the default Poppins font.
    return <span className="text-xl">{text}</span>;
};


// A small component to render the option image consistently.
const OptionImage: React.FC<{ imageUrl?: string; altText: string }> = ({ imageUrl, altText }) => {
    if (!imageUrl) {
        return null;
    }
    return <img src={imageUrl} alt={altText} className="mt-2 rounded-md max-w-full max-h-64 object-contain" />;
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
                            const baseClasses = "p-4 border rounded-lg cursor-pointer transition-colors flex items-center";
                            const selectedClasses = "border-blue-500 bg-blue-50 ring-2 ring-blue-500";
                            const unselectedClasses = "border-gray-300 hover:bg-gray-100";

                            return (
                                <div key={option.id}
                                     onClick={() => handleComplexChange(option.id)}
                                     className={`${baseClasses} ${isChecked ? selectedClasses : unselectedClasses}`}
                                >
                                    {style === 'checkbox' && (
                                         <input type="checkbox" checked={!!isChecked} readOnly className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3" />
                                    )}
                                    {style === 'toggle' && (
                                        <div className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full mr-4 border-2 transition-all ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-400 text-gray-600'}`}>
                                            {isChecked ? (
                                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <span className="text-sm font-bold">{String.fromCharCode(65 + index)}</span>
                                            )}
                                        </div>
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
                        className="py-3 text-lg"
                    />
                );

            case QuestionType.ESSAY:
                return (
                    <textarea
                        placeholder="Ketik jawaban uraian Anda di sini..."
                        rows={8}
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