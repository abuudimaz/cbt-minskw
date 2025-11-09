import React, { useRef, useEffect } from 'react';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { MagnifyingGlassIcon } from './AdminIcons';
import { Student, Exam, ExamResult } from '../../types';

interface GlobalSearchProps {
    onStudentSelect: (student: Student) => void;
    onExamSelect: (exam: Exam) => void;
    onResultSelect: (result: ExamResult) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onStudentSelect, onExamSelect, onResultSelect }) => {
    const { query, setQuery, results, isLoading, isFocused, setIsFocused } = useGlobalSearch();
    const searchRef = useRef<HTMLDivElement>(null);

    const hasResults = results.students.length > 0 || results.exams.length > 0 || results.results.length > 0;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setIsFocused]);

    const handleSelect = (item: Student | Exam | ExamResult, type: 'student' | 'exam' | 'result') => {
        if (type === 'student') onStudentSelect(item as Student);
        if (type === 'exam') onExamSelect(item as Exam);
        if (type === 'result') onResultSelect(item as ExamResult);
        setQuery('');
        setIsFocused(false);
    };

    return (
        <div className="relative w-full max-w-lg" ref={searchRef}>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                     <MagnifyingGlassIcon />
                </div>
                <input
                    type="text"
                    placeholder="Cari siswa, ujian, atau hasil..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className="block w-full rounded-md border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>
            
            {isFocused && (query.trim().length > 0 || isLoading) && (
                <div className="absolute z-10 mt-1 max-h-96 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {isLoading && <div className="px-4 py-2 text-gray-500">Mencari...</div>}
                    {!isLoading && !hasResults && query.trim().length > 0 && <div className="px-4 py-2 text-gray-500">Tidak ada hasil ditemukan.</div>}
                    
                    {!isLoading && hasResults && (
                        <>
                            {results.students.length > 0 && (
                                <div>
                                    <h3 className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">Siswa</h3>
                                    <ul>{results.students.map(student => (
                                        <li key={student.nis} onClick={() => handleSelect(student, 'student')} className="cursor-pointer select-none px-4 py-2 text-gray-900 hover:bg-blue-50">
                                            {student.name} ({student.nis})
                                        </li>
                                    ))}</ul>
                                </div>
                            )}
                            {results.exams.length > 0 && (
                                <div>
                                    <h3 className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">Ujian</h3>
                                    <ul>{results.exams.map(exam => (
                                        <li key={exam.id} onClick={() => handleSelect(exam, 'exam')} className="cursor-pointer select-none px-4 py-2 text-gray-900 hover:bg-blue-50">
                                            {exam.name}
                                        </li>
                                    ))}</ul>
                                </div>
                            )}
                            {results.results.length > 0 && (
                                <div>
                                    <h3 className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">Hasil Ujian</h3>
                                    <ul>{results.results.map(result => (
                                        <li key={result.id} onClick={() => handleSelect(result, 'result')} className="cursor-pointer select-none px-4 py-2 text-gray-900 hover:bg-blue-50">
                                            {result.name} - {result.examName}
                                        </li>
                                    ))}</ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;