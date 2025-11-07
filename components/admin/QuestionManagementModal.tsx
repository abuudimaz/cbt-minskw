import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Exam, Question, QuestionType, QuestionOption } from '../../types';
import { apiGetQuestionsForExam, apiCreateQuestion, apiUpdateQuestion, apiDeleteQuestion } from '../../services/api';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Input from '../shared/Input';
import LoadingSpinner from '../shared/LoadingSpinner';

const base64FromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const QuestionForm: React.FC<{
    question: Omit<Question, 'id' | 'examId'> | Question | null;
    onSave: (questionData: Omit<Question, 'id' | 'examId'> | Question) => void;
    onCancel: () => void;
}> = ({ question, onSave, onCancel }) => {
    
    const getInitialFormData = useCallback(() => ({
        questionText: '',
        questionImageUrl: '',
        type: QuestionType.SINGLE_CHOICE,
        options: [{ id: `new_opt_${Date.now()}_1`, text: '' }, { id: `new_opt_${Date.now()}_2`, text: '' }],
        matchingPrompts: [{ id: `new_prompt_${Date.now()}`, text: '' }],
        matchingAnswers: [{ id: `new_ans_${Date.now()}`, text: '' }],
        correctAnswer: undefined,
    }), []);

    const [formData, setFormData] = useState<any>(getInitialFormData());
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (question) {
            setFormData({
                ...getInitialFormData(),
                ...question,
                options: question.options && question.options.length > 0 ? question.options : getInitialFormData().options,
                matchingPrompts: question.matchingPrompts && question.matchingPrompts.length > 0 ? question.matchingPrompts : getInitialFormData().matchingPrompts,
                matchingAnswers: question.matchingAnswers && question.matchingAnswers.length > 0 ? question.matchingAnswers : getInitialFormData().matchingAnswers,
            });
        } else {
            setFormData(getInitialFormData());
        }
    }, [question, getInitialFormData]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.questionText.trim()) newErrors.questionText = "Teks pertanyaan tidak boleh kosong.";

        if (formData.type === QuestionType.SINGLE_CHOICE || formData.type === QuestionType.MULTIPLE_CHOICE_COMPLEX) {
            if (formData.options.some((opt: QuestionOption) => !opt.text.trim())) {
                newErrors.options = "Semua opsi jawaban harus diisi teks.";
            }
            if (!formData.correctAnswer || formData.correctAnswer.length === 0) {
                 newErrors.correctAnswer = "Kunci jawaban harus ditentukan.";
            }
        }
        
        if (formData.type === QuestionType.SHORT_ANSWER && !formData.correctAnswer) {
             newErrors.correctAnswer = "Kunci jawaban untuk isian singkat tidak boleh kosong.";
        }

        if(formData.type === QuestionType.MATCHING) {
            if(formData.matchingPrompts.some(p => !p.text.trim()) || formData.matchingAnswers.some(a => !a.text.trim())){
                 newErrors.matching = "Semua pernyataan dan pilihan jawaban menjodohkan harus diisi.";
            }
            if(Object.keys(formData.correctAnswer || {}).length !== formData.matchingPrompts.length){
                 newErrors.correctAnswer = "Semua pernyataan harus dipasangkan dengan jawaban.";
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, fieldPath: string, index: number | null = null) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await base64FromFile(file);
            if (index !== null) {
                // Handle image in options array
                const newOptions = [...formData.options];
                newOptions[index] = { ...newOptions[index], [fieldPath]: base64 };
                setFormData(prev => ({ ...prev, options: newOptions }));
            } else {
                 setFormData(prev => ({ ...prev, [fieldPath]: base64 }));
            }
        }
    };
    
    // --- Change Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if(name === 'type') setFormData(prev => ({...prev, correctAnswer: undefined})); // Reset answer on type change
    };
    
    const handleOptionTextChange = (index: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = { ...newOptions[index], text: value };
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const addOption = () => setFormData(prev => ({ ...prev, options: [...prev.options, { id: `new_opt_${Date.now()}`, text: '' }] }));
    const removeOption = (index: number) => setFormData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
    
    // --- Render Methods for Answer Types ---

    const renderChoiceAnswerFields = () => (
        <div className="space-y-3">
             <h4 className="font-semibold text-gray-800">Opsi Jawaban & Kunci</h4>
            {errors.options && <p className="text-sm text-red-500">{errors.options}</p>}
            {errors.correctAnswer && <p className="text-sm text-red-500">{errors.correctAnswer}</p>}
            {formData.options.map((opt, index) => (
                 <div key={opt.id || index} className="p-3 border rounded-lg bg-white space-y-3">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-10 flex items-center">
                            {formData.type === QuestionType.SINGLE_CHOICE ? (
                                <input type="radio" name="correctAnswer" checked={formData.correctAnswer === opt.id} onChange={() => setFormData(prev => ({...prev, correctAnswer: opt.id}))} className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"/>
                            ) : (
                                <input type="checkbox" checked={formData.correctAnswer?.includes(opt.id)} onChange={() => {
                                    const current: string[] = formData.correctAnswer || [];
                                    const newAnswers = current.includes(opt.id) ? current.filter(id => id !== opt.id) : [...current, opt.id];
                                    setFormData(prev => ({...prev, correctAnswer: newAnswers}))
                                }} className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            )}
                        </div>
                        <div className="flex-grow">
                             <Input 
                                 value={opt.text} 
                                 onChange={e => handleOptionTextChange(index, e.target.value)} 
                                 placeholder={`Teks Opsi ${String.fromCharCode(65 + index)}`}
                                 className="w-full"
                            />
                        </div>
                        <Button type="button" variant="danger" size="sm" onClick={() => removeOption(index)} disabled={formData.options.length <= 2}>X</Button>
                    </div>
                     <div className="pl-8 flex items-center gap-4">
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'optionImageUrl', index)} className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
                        {opt.optionImageUrl && <img src={opt.optionImageUrl} alt="Preview" className="h-16 w-auto rounded border p-1 bg-white"/>}
                    </div>
                </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addOption}>+ Tambah Opsi</Button>
        </div>
    );
    
    // Simplified form structure
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">{question ? 'Edit Soal' : 'Tambah Soal Baru'}</h3>
                 <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
                    &larr; Kembali ke Daftar
                </Button>
            </div>

            {/* Question Core Info */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                 <div>
                    <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1">Teks Pertanyaan</label>
                    <textarea id="questionText" name="questionText" rows={5} value={formData.questionText} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                    {errors.questionText && <p className="text-sm text-red-500 mt-1">{errors.questionText}</p>}
                </div>
                 <div className="flex items-center gap-4">
                     <label className="text-sm font-medium text-gray-700">Gambar Soal:</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'questionImageUrl')} className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
                    {formData.questionImageUrl && <img src={formData.questionImageUrl} alt="Preview Soal" className="h-24 w-auto rounded border p-1 bg-white"/>}
                 </div>
                 <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipe Soal</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                        {Object.values(QuestionType).filter(t => t !== QuestionType.SURVEY).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Answer Fields */}
            <div className="mt-6">
                {(formData.type === QuestionType.SINGLE_CHOICE || formData.type === QuestionType.MULTIPLE_CHOICE_COMPLEX) && renderChoiceAnswerFields()}
                {formData.type === QuestionType.SHORT_ANSWER && <Input label="Jawaban Benar" value={formData.correctAnswer || ''} onChange={e => setFormData(prev => ({...prev, correctAnswer: e.target.value}))} />}
            </div>

             <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={onCancel}>Batal</Button>
                <Button type="submit">Simpan Soal</Button>
            </div>
        </form>
    );
};

// FIX: Define QuestionManagementModalProps interface
interface QuestionManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    exam: Exam;
    onQuestionsUpdate: () => void;
}

const QuestionManagementModal: React.FC<QuestionManagementModalProps> = ({ isOpen, onClose, exam, onQuestionsUpdate }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    const fetchQuestions = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await apiGetQuestionsForExam(exam.id);
            setQuestions(data);
        } catch (err) { setError('Gagal memuat soal.'); } 
        finally { setIsLoading(false); }
    }, [exam.id]);

    useEffect(() => {
        if (isOpen) fetchQuestions();
        else { setIsFormOpen(false); setEditingQuestion(null); }
    }, [isOpen, fetchQuestions]);

    const handleOpenForm = (question: Question | null = null) => { setEditingQuestion(question); setIsFormOpen(true); };
    const handleCloseForm = () => { setIsFormOpen(false); setEditingQuestion(null); };

    const handleSaveQuestion = async (questionData: Omit<Question, 'id' | 'examId'> | Question) => {
        try {
            if ('id' in questionData) await apiUpdateQuestion(questionData);
            else await apiCreateQuestion(exam.id, questionData);
            handleCloseForm();
            await fetchQuestions();
            onQuestionsUpdate();
        } catch (err: any) { alert(`Gagal menyimpan soal: ${err.message}`); }
    };
    
    const handleDeleteQuestion = async (questionId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
            try {
                await apiDeleteQuestion(questionId);
                await fetchQuestions();
                onQuestionsUpdate();
            } catch (err) { alert('Gagal menghapus soal.'); }
        }
    };
    
    const typeColorMap: Record<QuestionType, string> = {
        [QuestionType.SINGLE_CHOICE]: 'bg-blue-100 text-blue-800',
        [QuestionType.MULTIPLE_CHOICE_COMPLEX]: 'bg-purple-100 text-purple-800',
        [QuestionType.MATCHING]: 'bg-indigo-100 text-indigo-800',
        [QuestionType.SHORT_ANSWER]: 'bg-yellow-100 text-yellow-800',
        [QuestionType.ESSAY]: 'bg-green-100 text-green-800',
        [QuestionType.SURVEY]: 'bg-gray-100 text-gray-800',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isFormOpen ? `Soal untuk ${exam.name}` : `Manajemen Soal: ${exam.name}`} size="xl">
            {isFormOpen ? (
                <QuestionForm question={editingQuestion} onSave={handleSaveQuestion} onCancel={handleCloseForm} />
            ) : (
                <>
                    <div className="mb-4 flex justify-end">
                        <Button onClick={() => handleOpenForm(null)}>+ Tambah Soal Manual</Button>
                    </div>
                    {isLoading && <LoadingSpinner text="Memuat soal..." />}
                    {error && <p className="text-red-500">{error}</p>}
                    {!isLoading && !error && (
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {questions.length > 0 ? questions.map((q, index) => (
                                <div key={q.id} className="p-4 border rounded-lg flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-700">{index + 1}.</span>
                                            <p className="font-medium text-gray-800 truncate" title={q.questionText}>{q.questionText}</p>
                                        </div>
                                        <div className="mt-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColorMap[q.type]}`}>{q.type}</span>
                                        </div>
                                    </div>
                                    <div className="space-x-2 flex-shrink-0 ml-4">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenForm(q)}>Edit</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteQuestion(q.id)}>Hapus</Button>
                                    </div>
                                </div>
                            )) : <p className="text-center text-gray-500 py-10">Belum ada soal untuk ujian ini. Silakan tambah soal secara manual atau impor dari file.</p>}
                        </div>
                    )}
                </>
            )}
        </Modal>
    );
};

export default QuestionManagementModal;