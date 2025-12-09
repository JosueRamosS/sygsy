import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "CONFIRMAR",
    cancelText = "CANCELAR",
    isLoading = false
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 bg-neo-yellow border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <AlertCircle size={48} className="text-black" strokeWidth={2.5} />
                </div>

                <p className="text-lg font-bold text-gray-800">
                    {message}
                </p>

                <div className="flex gap-4 w-full pt-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        className="flex-1 bg-neo-green hover:bg-green-600 text-black"
                        disabled={isLoading}
                    >
                        {isLoading ? 'PROCESANDO...' : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
