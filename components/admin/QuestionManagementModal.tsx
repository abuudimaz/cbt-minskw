// FIX: Removed invalid HTML-style comments from the top of the file.
import React, { useState, useEffect, useCallback } from 'react';
import { Exam, Question, QuestionType, QuestionOption, MatchingPrompt, MatchingAnswer } from '../../types';
import { apiGetQuestionsForExam, apiCreateQuestion, apiUpdateQuestion, apiDeleteQuestion } from '../../services/api';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Input from '../shared/Input';
import LoadingSpinner from '../shared/LoadingSpinner';

// Sub-component for the question form, kept within this file for simplicity.
const QuestionForm: React.FC<{
    question: Omit<Question, 'id' | 'examId'> | Question | null;
    onSave: (questionData: Omit<Question, 'id' | 'examId'> | Question) => void;
    onCancel: () => void;
}> = ({ question, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Question>>({
        questionText: '',
        type: QuestionType.SINGLE_CHOICE,
        options: [{ id: 'opt1', text: '' }, { id: 'opt2', text: '' }],
        matchingPrompts: [{ id: 'p1', text: '' }],
        matchingAnswers: [{ id: 'a1', text: '' }],
        correctAnswer: undefined,
        ...question,
    });
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(formData.options || [])];
        newOptions[index].text = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };
    
    const handleOptionImageChange = (index: number, value: string) => {
        const newOptions = [...(formData.options || [])];
        newOptions[index].optionImageUrl = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const addOption = () => {
        const newOptions = [...(formData.options || []), { id: `opt${Date.now()}`, text: '' }];
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const removeOption = (index: number) => {
        const newOptions = [...(formData.options || [])];
        newOptions.splice(index, 1);
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Reset error on new submission

        // --- VALIDATION LOGIC ---
        if (!formData.questionText?.trim()) {
            setError('Teks pertanyaan tidak boleh kosong.');
            return;
        }

        const { type, options, correctAnswer } = formData;

        if (type === QuestionType.SINGLE_CHOICE || type === QuestionType.MULTIPLE_CHOICE_COMPLEX) {
            if (!options || options.length < 2) {
                setError('Minimal harus ada 2 opsi jawaban.');
                return;
            }
            if (options.some(opt => !opt.text.trim())) {
                setError('Teks opsi jawaban tidak boleh kosong.');
                return;
            }
        }
    
        switch (type) {
            case QuestionType.SINGLE_CHOICE:
                if (!correctAnswer) {
                    setError('Kunci jawaban untuk Pilihan Ganda harus dipilih.');
                    return;
                }
                if (!options?.some(opt => opt.id === correctAnswer)) {
                    setError('Kunci jawaban yang dipilih tidak valid (tidak cocok dengan opsi yang ada).');
                    return;
                }
                break;
                
            case QuestionType.MULTIPLE_CHOICE_COMPLEX:
                if (!Array.isArray(correctAnswer) || correctAnswer.length === 0) {
                    setError('Kunci jawaban untuk Pilihan Ganda Kompleks harus dipilih (minimal satu).');
                    return;
                }
                const optionIds = options?.map(opt => opt.id) || [];
                if (!correctAnswer.every(ansId => optionIds.includes(ansId))) {
                     setError('Satu atau lebih kunci jawaban yang dipilih tidak valid.');
                     return;
                }
                break;

            case QuestionType.SHORT_ANSWER:
                if (typeof correctAnswer !== 'string' || !correctAnswer.trim()) {
                    setError('Kunci jawaban untuk Isian Singkat tidak boleh kosong.');
                    return;
                }
                break;
        }

        onSave(formData as Question);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1">Teks Pertanyaan</label>
                <textarea name="questionText" id="questionText" rows={4} value={formData.questionText} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
            </div>
             <Input label="URL Gambar Pertanyaan (opsional)" name="questionImageUrl" value={formData.questionImageUrl || ''} onChange={handleInputChange} />
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipe Soal</label>
                <select name="type" id="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    {Object.values(QuestionType).filter(t => t !== QuestionType.SURVEY).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
            
            {(formData.type === QuestionType.SINGLE_CHOICE || formData.type === QuestionType.MULTIPLE_CHOICE_COMPLEX) && (
                 <div>
                    <h4 className="text-md font-semibold mb-2">Opsi Jawaban</h4>
                    <div className="space-y-3">
                        {formData.options?.map((opt, index) => (
                            <div key={index} className="p-3 border rounded-md bg-gray-50">
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-gray-600">{String.fromCharCode(65 + index)}.</span>
                                    <Input 
                                        className="flex-grow" 
                                        placeholder={`Teks Opsi ${String.fromCharCode(65 + index)}`} 
                                        value={opt.text} 
                                        onChange={e => handleOptionChange(index, e.target.value)} 
                                    />
                                    <Button type="button" variant="danger" size="sm" onClick={() => removeOption(index)} disabled={formData.options!.length <= 2}>X</Button>
                                </div>
                                <div className="mt-2 pl-7">
                                    <Input 
                                        className="text-sm py-1"
                                        placeholder="URL Gambar Opsi (opsional)" 
                                        value={opt.optionImageUrl || ''} 
                                        onChange={e => handleOptionImageChange(index, e.target.value)} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={addOption} className="mt-3">
                        + Tambah Opsi
                    </Button>

                    <h4 className="text-md font-semibold mt-4">Kunci Jawaban</h4>
                    {formData.type === QuestionType.SINGLE_CHOICE && (
                        <select name="correctAnswer" value={formData.correctAnswer as string || ''} onChange={handleInputChange} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md">
                            <option value="" disabled>Pilih Jawaban Benar</option>
                            {formData.options?.map((opt, index) => <option key={opt.id} value={opt.id}>{`Opsi ${String.fromCharCode(65 + index)}: ${opt.text.substring(0, 50)}...`}</option>)}
                        </select>
                    )}
                    {formData.type === QuestionType.MULTIPLE_CHOICE_COMPLEX && (
                        <div className="mt-2 space-y-2">
                        {formData.options?.map((opt, index) => (
                            <div key={opt.id} className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id={`cb-${opt.id}`}
                                    checked={(formData.correctAnswer as string[] || []).includes(opt.id)}
                                    onChange={() => {
                                        const current = (formData.correctAnswer as string[] || []);
                                        const newAnswer = current.includes(opt.id) ? current.filter(id => id !== opt.id) : [...current, opt.id];
                                        setFormData(prev => ({...prev, correctAnswer: newAnswer}));
                                    }}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor={`cb-${opt.id}`} className="ml-2 text-sm text-gray-700">{`Opsi ${String.fromCharCode(65 + index)}: ${opt.text}`}</label>
                            </div>
                        ))}
                        </div>
                    )}
                </div>
            )}
             {formData.type === QuestionType.SHORT_ANSWER && <Input label="Jawaban Benar" name="correctAnswer" value={formData.correctAnswer as string || ''} onChange={handleInputChange} />}
             {formData.type === QuestionType.ESSAY && <p className="text-sm text-gray-500">Jawaban esai diperiksa manual dan tidak masuk skor otomatis.</p>}
            
            {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
            
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Batal</Button>
                <Button type="submit">Simpan Soal</Button>
            </div>
        </form>
    );
};


// Main Modal Component
interface QuestionManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    exam: Exam;
    onQuestionsUpdate: () => void; // To refresh exam list count
}

const QuestionManagementModal: React.FC<QuestionManagementModalProps> = ({ isOpen, onClose, exam, onQuestionsUpdate }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    const fetchQuestions = useCallback(async () => {
        if (!exam) return;
        setIsLoading(true);
        try {
            const data = await apiGetQuestionsForExam(exam.id);
            setQuestions(data);
        } catch (err) {
            setError('Gagal memuat soal.');
        } finally {
            setIsLoading(false);
        }
    }, [exam]);

    useEffect(() => {
        if (isOpen) {
            fetchQuestions();
        }
    }, [isOpen, fetchQuestions]);

    const handleOpenForm = (question: Question | null) => {
        setEditingQuestion(question);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingQuestion(null);
    };

    const handleSaveQuestion = async (questionData: Omit<Question, 'id' | 'examId'> | Question) => {
        try {
            if ('id' in questionData) {
                await apiUpdateQuestion(questionData);
            } else {
                await apiCreateQuestion(exam.id, questionData);
            }
            fetchQuestions();
            onQuestionsUpdate(); // Notify parent
            handleCloseForm();
        } catch (err: any) {
            alert(`Gagal menyimpan soal: ${err.message}`);
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
            try {
                await apiDeleteQuestion(questionId);
                fetchQuestions();
                onQuestionsUpdate();
            } catch (err) {
                alert('Gagal menghapus soal.');
            }
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Manajemen Soal: ${exam?.name}`} size="xl">
            <div className="mb-4 flex justify-end">
                <Button onClick={() => handleOpenForm(null)}>+ Tambah Soal</Button>
            </div>
            {isLoading ? (
                <LoadingSpinner text="Memuat soal..." />
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {questions.length > 0 ? questions.map((q, index) => (
                        <div key={q.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 mr-4">
                                    <p className="font-semibold text-gray-800">{index + 1}. {q.questionText}</p>
                                    <p className="text-sm text-gray-500 mt-1">Tipe: {q.type}</p>
                                </div>
                                <div className="flex-shrink-0 space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleOpenForm(q)}>Edit</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDeleteQuestion(q.id)}>Hapus</Button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 py-4">Belum ada soal untuk ujian ini.</p>
                    )}
                </div>
            )}
            
            {isFormOpen && (
                 <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'} size="lg">
                     <QuestionForm 
                        question={editingQuestion}
                        onSave={handleSaveQuestion}
                        onCancel={handleCloseForm}
                     />
                 </Modal>
            )}
        </Modal>
    );
};

export default QuestionManagementModal;