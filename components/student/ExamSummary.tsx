
import React from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';

interface ExamSummaryProps {
    onFinish: () => void;
}

const ExamSummary: React.FC<ExamSummaryProps> = ({ onFinish }) => {
    return (
        <div className="max-w-lg mx-auto mt-10 text-center">
            <Card>
                <div className="p-6">
                    <svg className="w-16 h-16 mx-auto text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <h2 className="text-2xl font-bold text-gray-800 mt-4">Ujian Selesai!</h2>
                    <p className="text-gray-600 mt-2 mb-6">
                        Terima kasih telah menyelesaikan asesmen. Jawaban Anda telah berhasil dikirim.
                    </p>
                    <Button onClick={onFinish}>
                        Kembali ke Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ExamSummary;
