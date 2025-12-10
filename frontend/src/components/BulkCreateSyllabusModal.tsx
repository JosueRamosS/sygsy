import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { periodApi } from '../api/periodApi';
import type { AcademicPeriod } from '../api/periodApi';
import { syllabusApi } from '../api/syllabusApi';
import { NeoSelect } from './ui/NeoSelect';
import { FileSpreadsheet, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface BulkCreateSyllabusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const BulkCreateSyllabusModal: React.FC<BulkCreateSyllabusModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [academicPeriodId, setAcademicPeriodId] = useState<number>(0);

    useEffect(() => {
        if (isOpen) {
            loadDependencies();
            setFile(null);
            setAcademicPeriodId(0);
        }
    }, [isOpen]);

    const loadDependencies = async () => {
        try {
            const perds = await periodApi.getAll();
            setPeriods(perds);
            if (perds.length > 0) {
                setAcademicPeriodId(perds[0].id);
            }
        } catch (error) {
            toast.error('Error al cargar periodos');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!academicPeriodId) {
            toast.error('Selecciona un Periodo Académico');
            return;
        }
        if (!file) {
            toast.error('Debes subir el Excel Masivo');
            return;
        }

        setLoading(true);
        try {
            await syllabusApi.uploadBulk(file, academicPeriodId);
            toast.success('Carga masiva completada exitosamente');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || error.response?.data || error.message || 'Error desconocido';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const periodOptions = periods.map(p => ({ value: p.id, label: p.name }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Carga Masiva de Sílabos">
            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="bg-neo-yellow p-4 border-2 border-black font-medium text-sm">
                    <p className="font-bold flex items-center gap-2 mb-2">
                        <Download size={18} /> Instrucciones:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>El Excel debe contener las columnas desde Facultad hasta Email Docente.</li>
                        <li>El email del docente debe existir en el sistema.</li>
                        <li>Se crearán múltiples sílabos en estado CREADO.</li>
                    </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <NeoSelect
                        label="Periodo Académico"
                        value={academicPeriodId}
                        onChange={(val) => setAcademicPeriodId(Number(val))}
                        options={periodOptions}
                        placeholder="Seleccionar Periodo..."
                    />

                    <a
                        href="/lista_cursos_masiva.xlsx"
                        download="lista_cursos_masiva.xlsx"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-neo-green text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-sm"
                    >
                        <Download size={18} />
                        Bajar Plantilla
                    </a>
                </div>

                {/* File Upload Area */}
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase">Archivo Excel Masivo</label>
                    <div className="flex flex-col items-center justify-center border-3 border-dashed border-black p-8 bg-gray-50 hover:bg-white transition-colors cursor-pointer relative group">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        {file ? (
                            <div className="text-center relative z-20">
                                <FileSpreadsheet size={48} className="mx-auto mb-2 text-neo-blue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
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
                                <p className="font-bold text-lg text-gray-600 group-hover:text-black">Subir Excel Masivo</p>
                                <p className="text-sm text-gray-400">Archivos .xlsx o .xls</p>
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full mt-6 py-4 text-lg bg-neo-blue hover:bg-blue-600 text-white"
                    disabled={loading}
                >
                    {loading ? 'PROCESANDO...' : 'INICIAR CARGA MASIVA'}
                </Button>


            </form>
        </Modal>
    );
};
