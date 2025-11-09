import { useState, useEffect } from 'react';
import { Student, Exam, ExamResult } from '../types';
import { apiGetStudents, apiGetExams, apiGetExamResults } from '../services/api';

interface SearchResults {
    students: Student[];
    exams: Exam[];
    results: ExamResult[];
}

export const useGlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults>({ students: [], exams: [], results: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (!query.trim() || !isFocused) {
            setResults({ students: [], exams: [], results: [] });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const debounceTimer = setTimeout(async () => {
            try {
                const [students, exams, results] = await Promise.all([
                    apiGetStudents(),
                    apiGetExams(),
                    apiGetExamResults(),
                ]);

                const lowerCaseQuery = query.toLowerCase();

                const filteredStudents = students.filter(s =>
                    s.name.toLowerCase().includes(lowerCaseQuery) ||
                    s.nis.toLowerCase().includes(lowerCaseQuery)
                );

                const filteredExams = exams.filter(e =>
                    e.name.toLowerCase().includes(lowerCaseQuery)
                );

                const filteredResults = results.filter(r =>
                    r.name.toLowerCase().includes(lowerCaseQuery) ||
                    r.nis.toLowerCase().includes(lowerCaseQuery) ||
                    r.examName.toLowerCase().includes(lowerCaseQuery)
                );

                setResults({
                    students: filteredStudents.slice(0, 5), // Batasi hasil untuk performa
                    exams: filteredExams.slice(0, 5),
                    results: filteredResults.slice(0, 5),
                });
            } catch (error) {
                console.error("Global search failed:", error);
                setResults({ students: [], exams: [], results: [] });
            } finally {
                setIsLoading(false);
            }
        }, 300); // Penundaan 300ms

        return () => clearTimeout(debounceTimer);
    }, [query, isFocused]);

    return { query, setQuery, results, isLoading, isFocused, setIsFocused };
};
