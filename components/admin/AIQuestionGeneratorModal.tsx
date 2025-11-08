import React from 'react';
import { Exam } from '../../types';
import Modal from '../shared/Modal';
import Button from '../shared/Button';

// This component is currently disabled to ensure application stability.
// The AI integration was causing persistent loading errors.

interface AIQuestionGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    exam: Exam;
    onQuestionsGenerated: () => void;
}

const AIQuestionGeneratorModal: React.FC<AIQuestionGeneratorModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate Soal dengan AI (Dinonaktifkan)">
            <div className="p-4 text-center">
                <p className="text-gray-600">
                    Fitur ini telah dinonaktifkan untuk sementara waktu untuk meningkatkan stabilitas aplikasi.
                </p>
                <div className="mt-6">
                    <Button variant="secondary" onClick={onClose}>
                        Tutup
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AIQuestionGeneratorModal;
