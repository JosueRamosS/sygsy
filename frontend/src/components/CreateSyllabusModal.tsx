import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { userApi } from '../api/userApi';
import { periodApi } from '../api/periodApi';
import { careerApi } from '../api/careerApi';
import type { AcademicPeriod } from '../api/periodApi';
import type { Career } from '../api/careerApi';
import { syllabusApi } from '../api/syllabusApi';
import type { CreateSyllabusDTO } from '../api/syllabusApi';
import type { User } from '../types/auth';
import { NeoSelect } from './ui/NeoSelect';
import { FileSpreadsheet, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateSyllabusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateSyllabusModal: React.FC<CreateSyllabusModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const isAdmin = !user?.career && user?.role === 'COORDINATOR';
    const [professors, setProfessors] = useState<User[]>([]);
    const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<CreateSyllabusDTO>({
        courseName: '',
        courseCode: '',
        academicPeriodId: 0,
        professorEmail: '',
        career: ''
    });

    useEffect(() => {
        if (isOpen) {
            loadDependencies();
            setFile(null);
            setFormData(prev => ({ ...prev, professorEmail: '', academicPeriodId: 0, courseName: '', courseCode: '' }));
        }
    }, [isOpen]);

    const loadDependencies = async () => {
        try {
            const promises: Promise<any>[] = [
                userApi.getProfessors(),
                periodApi.getAll()
            ];

            const isAdmin = !user?.career && user?.role === 'COORDINATOR';
            if (isAdmin) {
                promises.push(careerApi.getAll());
            }

            const results = await Promise.all(promises);
            const profs = results[0];
            const perds = results[1];

            setProfessors(profs);
            setPeriods(perds);

            if (isAdmin && results[2]) {
                setCareers(results[2]);
            }

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
        if (isAdmin && !formData.career) {
            toast.error('Como administrador, debes seleccionar una Carrera');
            return;
        }

        setLoading(true);
        let tempSyllabusId: number | null = null;

        try {
            if (file) {
                // Excel Mode: Shell -> Upload
                const shellData: CreateSyllabusDTO = {
                    ...formData,
                    courseName: 'Procesando Excel...',
                    courseCode: 'TMP-' + Date.now().toString().slice(-4)
                };
                const newSyllabus = await syllabusApi.create(shellData);
                tempSyllabusId = newSyllabus.id;

                await syllabusApi.uploadExcel(newSyllabus.id, file);
                toast.success('Sílabo creado y procesado (Excel)');
            } else {
                // Manual Mode
                if (!formData.courseName || !formData.courseCode) {
                    toast.error('Ingresa el Nombre y Código del Curso (o sube un Excel)');
                    setLoading(false);
                    return;
                }
                await syllabusApi.create(formData);
                toast.success('Sílabo creado manualmente');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error al crear el sílabo.';
            toast.error(msg);

            // Rollback if temp syllabus was created but upload failed
            if (tempSyllabusId) {
                try {
                    await syllabusApi.delete(tempSyllabusId);
                    console.log('Rolled back temp syllabus', tempSyllabusId);
                } catch (delError) {
                    console.error('Failed to rollback temp syllabus', delError);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // Transform data for NeoSelect
    const periodOptions = periods.map(p => ({ value: p.id, label: p.name }));
    const professorOptions = professors.map(p => ({ value: p.username, label: `${p.fullName} (${p.username})` }));
    const careerOptions = careers.map(c => ({ value: c.name, label: c.name }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Sílabo (Individual)">
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

                    {isAdmin && (
                        <NeoSelect
                            label="Carrera (Admin)"
                            value={formData.career || ''}
                            onChange={(val) => setFormData(prev => ({ ...prev, career: String(val) }))}
                            options={careerOptions}
                            placeholder="Seleccionar Carrera..."
                        />
                    )}

                    <NeoSelect
                        label="Docente Encargado"
                        value={formData.professorEmail}
                        onChange={(val) => setFormData(prev => ({ ...prev, professorEmail: String(val) }))}
                        options={professorOptions}
                        placeholder="Buscar Docente..."
                    />
                </div>

                {/* Manual Inputs */}
                <div className="space-y-4">
                    <Input
                        label="Nombre del Curso"
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleChange}
                        placeholder="Ej: Ingeniería de Software I"
                        disabled={!!file}
                    />

                    <Input
                        label="Código del Curso"
                        name="courseCode"
                        value={formData.courseCode}
                        onChange={handleChange}
                        placeholder="Ej: SIS01"
                        disabled={!!file}
                    />
                </div>

                {/* File Upload Area (Optional) */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <label className="text-sm font-bold uppercase">
                            Archivo Excel {file && <span className="text-neo-green">(Seleccionado)</span>}
                        </label>
                        <a
                            href="/plantilla_unitario.xlsx"
                            download="plantilla_unitario.xlsx"
                            className="flex items-center gap-2 px-3 py-1 bg-neo-green text-black font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase"
                        >
                            <Download size={14} />
                            Plantilla
                        </a>
                    </div>
                    <div className={`flex flex-col items-center justify-center border-2 border-dashed px-8 py-6 transition-colors cursor-pointer relative group ${file ? 'border-neo-green bg-green-50' : 'border-black bg-gray-50 hover:bg-white'}`}>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        {file ? (
                            <div className="text-center relative z-20">
                                <FileSpreadsheet size={32} className="mx-auto mb-1 text-neo-green drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                                <p className="font-bold text-sm">{file.name}</p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFile(null);
                                    }}
                                    className="text-xs font-bold text-red-600 hover:text-red-800 underline relative z-30 mt-1"
                                >
                                    Quitar archivo
                                </button>
                            </div>
                        ) : (
                            <div className="text-center group-hover:scale-105 transition-transform duration-200">
                                <Upload size={32} className="mx-auto mb-1 text-gray-400 group-hover:text-black" />
                                <p className="font-bold text-sm text-gray-600 group-hover:text-black">Subir Excel (Opcional)</p>
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full mt-2 py-4 text-lg bg-neo-blue text-white hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? 'CREANDO...' : 'CREAR'}
                </Button>

            </form>
        </Modal >
    );
};
