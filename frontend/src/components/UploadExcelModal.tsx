import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { syllabusApi } from '../api/syllabusApi';
import toast from 'react-hot-toast';
import { FileSpreadsheet, Upload } from 'lucide-react';

interface UploadExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    syllabusId: number | null;
}

export const UploadExcelModal: React.FC<UploadExcelModalProps> = ({ isOpen, onClose, onSuccess, syllabusId }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !syllabusId) {
            toast.error('Selecciona un archivo válido');
            return;
        }

        setLoading(true);
        try {
            await syllabusApi.uploadExcel(syllabusId, file);
            toast.success('Excel cargado correctamente');
            onSuccess(); // Refresh list potentially
            onClose();
            setFile(null); // Reset file
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar el Excel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cargar Datos (Excel)">
            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="flex flex-col items-center justify-center border-3 border-dashed border-black p-8 bg-gray-50 hover:bg-white transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {file ? (
                        <div className="text-center">
                            <FileSpreadsheet size={48} className="mx-auto mb-2 text-neo-green" />
                            <p className="font-bold text-lg">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Upload size={48} className="mx-auto mb-2 text-gray-400" />
                            <p className="font-bold text-lg">Arrastra o clic para seleccionar</p>
                            <p className="text-sm text-gray-500">Archivos .xlsx o .xls</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading || !file} variant="primary" className="bg-neo-green hover:bg-green-600 text-black">
                        {loading ? 'Subiendo...' : 'SUBIR EXCEL'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
