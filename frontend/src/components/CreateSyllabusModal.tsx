import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { userApi } from '../api/userApi';
import { periodApi } from '../api/periodApi';
import type { AcademicPeriod } from '../api/periodApi';
import { syllabusApi } from '../api/syllabusApi';
import type { CreateSyllabusDTO } from '../api/syllabusApi';
import type { User } from '../types/auth';
import { NeoSelect } from './ui/NeoSelect';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateSyllabusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateSyllabusModal: React.FC<CreateSyllabusModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [professors, setProfessors] = useState<User[]>([]);
    const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<CreateSyllabusDTO>({
        courseName: '', // Will be ignored/placeholder
        courseCode: '', // Will be ignored/placeholder
        academicPeriodId: 0,
        professorEmail: '',
    });

    useEffect(() => {
        if (isOpen) {
            loadDependencies();
            setFile(null);
            setFormData(prev => ({ ...prev, professorEmail: '', academicPeriodId: 0 }));
        }
    }, [isOpen]);

    const loadDependencies = async () => {
        try {
            const [profs, perds] = await Promise.all([
                userApi.getProfessors(),
                periodApi.getAll()
            ]);
            setProfessors(profs);
            setPeriods(perds);
            if (perds.length > 0) {
                setFormData(prev => ({ ...prev, academicPeriodId: perds[0].id }));
            }
        } catch (error) {
            toast.error('Error al cargar datos necesarios');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.academicPeriodId) {
            toast.error('Selecciona un Periodo Académico');
            return;
        }
        if (!formData.professorEmail) {
            toast.error('Selecciona un Docente');
            return;
        }
        if (!file) {
            toast.error('Debes subir el Excel del Sílabo');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Shell Syllabus
            const shellData: CreateSyllabusDTO = {
                ...formData,
                courseName: 'Procesando Excel...',
                courseCode: 'TMP-' + Date.now().toString().slice(-4)
            };

            const newSyllabus = await syllabusApi.create(shellData);

            // 2. Upload Excel immediately
            await syllabusApi.uploadExcel(newSyllabus.id, file);

            toast.success('Sílabo creado y procesado correctamente');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Error al procesar el sílabo. Verifica el archivo.');
        } finally {
            setLoading(false);
        }
    };

    // Transform data for NeoSelect
    const periodOptions = periods.map(p => ({ value: p.id, label: p.name }));
    const professorOptions = professors.map(p => ({ value: p.username, label: `${p.fullName} (${p.username})` }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Sílabo">
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Selects */}
                <div className="grid grid-cols-1 gap-6">
                    <NeoSelect
                        label="Periodo Académico"
                        value={formData.academicPeriodId}
                        onChange={(val) => setFormData(prev => ({ ...prev, academicPeriodId: Number(val) }))}
                        options={periodOptions}
                        placeholder="Seleccionar Periodo..."
                    />

                    <NeoSelect
                        label="Docente Encargado"
                        value={formData.professorEmail}
                        onChange={(val) => setFormData(prev => ({ ...prev, professorEmail: String(val) }))}
                        options={professorOptions}
                        placeholder="Buscar Docente..."
                    />
                </div>

                {/* File Upload Area */}
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase">Archivo Excel</label>
                    <div className="flex flex-col items-center justify-center border-3 border-dashed border-black p-8 bg-gray-50 hover:bg-white transition-colors cursor-pointer relative group">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        {file ? (
                            <div className="text-center relative z-20">
                                <FileSpreadsheet size={48} className="mx-auto mb-2 text-neo-green drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                                <p className="font-bold text-lg">{file.name}</p>
                                <p className="text-sm text-gray-500 mb-2">{(file.size / 1024).toFixed(2)} KB</p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFile(null);
                                    }}
                                    className="text-xs font-bold text-red-600 hover:text-red-800 underline relative z-30"
                                >
                                    Eliminar archivo
                                </button>
                            </div>
                        ) : (
                            <div className="text-center group-hover:scale-105 transition-transform duration-200">
                                <Upload size={48} className="mx-auto mb-2 text-gray-400 group-hover:text-black" />
                                <p className="font-bold text-lg text-gray-600 group-hover:text-black">Subir Excel del Sílabo</p>
                                <p className="text-sm text-gray-400">Archivos .xlsx o .xls</p>
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full mt-6 py-4 text-lg bg-neo-green hover:bg-green-400"
                    disabled={loading}
                >
                    {loading ? 'PROCESANDO...' : 'CREAR SÍLABO'}
                </Button>

            </form>
        </Modal>
    );
};
