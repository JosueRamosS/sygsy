import { useEffect, useState, useRef } from 'react';
import { useAuth } from "../context/AuthContext";
import { syllabusApi } from '../api/syllabusApi';
import type { Syllabus } from '../api/syllabusApi';
import { periodApi } from '../api/periodApi';
import type { AcademicPeriod } from '../api/periodApi';
import { CreateSyllabusModal } from '../components/CreateSyllabusModal';
import { BulkCreateSyllabusModal } from '../components/BulkCreateSyllabusModal';
import { UploadExcelModal } from '../components/UploadExcelModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { NeoSelect } from '../components/ui/NeoSelect';
import { Plus, FileSpreadsheet, Eye, Pencil, Send, Check, RotateCcw, ChevronDown, Layers, File, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


type ModalAction = 'ASSIGN' | 'APPROVE' | 'RETURN' | 'DELETE';

export const SyllabiPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
    const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<number | 'all'>('all');

    // Modals State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isUploadExcelModalOpen, setIsUploadExcelModalOpen] = useState(false);
    const [uploadSyllabusId, setUploadSyllabusId] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean,
        syllabus: Syllabus | null,
        action: ModalAction | null,
        isLoading: boolean
    }>({ isOpen: false, syllabus: null, action: null, isLoading: false });

    // Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchPeriods();
        fetchSyllabi();

        // Click outside for dropdown
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchPeriods = async () => {
        try {
            const data = await periodApi.getAll();
            setPeriods(data);
        } catch (error) {
            console.error('Error fetching periods:', error);
            toast.error('Error al cargar periodos');
        }
    };

    const fetchSyllabi = async () => {
        try {
            const data = await syllabusApi.getAll();
            setSyllabi(data);
        } catch (error) {
            console.error('Error fetching syllabi:', error);
            toast.error('Error al cargar sílabos');
        }
    };

    const handleCreateSuccess = () => {
        fetchSyllabi();
        setIsCreateModalOpen(false);
        setIsBulkModalOpen(false);
    };

    const handleUploadSuccess = () => {
        fetchSyllabi();
        setIsUploadExcelModalOpen(false);
        setUploadSyllabusId(null);
    };

    const handleOpenUpload = (id: number) => {
        setUploadSyllabusId(id);
        setIsUploadExcelModalOpen(true);
    };

    const handleViewPdf = async (id: number) => {
        try {
            const blob = await syllabusApi.getPdf(id);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Error al descargar el PDF');
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.syllabus || !confirmModal.action) return;

        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
            if (confirmModal.action === 'DELETE') {
                await syllabusApi.delete(confirmModal.syllabus.id);
                toast.success('Sílabo eliminado');
            } else {
                let newStatus: 'ASSIGNED' | 'APPROVED' | 'RETURNED';
                switch (confirmModal.action) {
                    case 'ASSIGN': newStatus = 'ASSIGNED'; break;
                    case 'APPROVE': newStatus = 'APPROVED'; break;
                    case 'RETURN': newStatus = 'RETURNED'; break;
                    default: return;
                }
                await syllabusApi.updateStatus(confirmModal.syllabus.id, newStatus);
                toast.success(`Sílabo ${newStatus === 'ASSIGNED' ? 'asignado' : newStatus === 'APPROVED' ? 'aprobado' : 'devuelto'} correctamente`);
            }
            fetchSyllabi();
            setConfirmModal({ isOpen: false, syllabus: null, action: null, isLoading: false });
        } catch (error) {
            console.error(error);
            toast.error('Error al procesar la acción');
            setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    const getModalContent = () => {
        const { syllabus, action } = confirmModal;
        if (!syllabus || !action) return { title: '', message: '', confirmText: '', isDanger: false };

        switch (action) {
            case 'ASSIGN':
                return {
                    title: 'Confirmar Asignación',
                    message: `¿Asignar sílabo "${syllabus.courseName}" al docente ${syllabus.professor?.fullName || 'seleccionado'}?`,
                    confirmText: 'ASIGNAR',
                    isDanger: false
                };
            case 'APPROVE':
                return {
                    title: 'Aprobar Sílabo',
                    message: `¿Estás seguro de APROBAR el sílabo de "${syllabus.courseName}"?`,
                    confirmText: 'APROBAR',
                    isDanger: false
                };
            case 'RETURN':
                return {
                    title: 'Devolver Sílabo',
                    message: `¿Devolver el sílabo de "${syllabus.courseName}" al docente para correcciones?`,
                    confirmText: 'DEVOLVER',
                    isDanger: false
                };
            case 'DELETE':
                return {
                    title: 'Eliminar Sílabo',
                    message: `¿Seguro que deseas eliminar el sílabo de "${syllabus.courseName}"? Esta acción no se puede deshacer.`,
                    confirmText: 'ELIMINAR',
                    isDanger: true
                };
            default:
                return { title: '', message: '', confirmText: '', isDanger: false };
        }
    };

    // Filter logic
    const filteredSyllabi = syllabi.filter(s => {
        if (selectedPeriod !== 'all' && s.academicPeriod?.id !== selectedPeriod) return false;
        if (user?.role === 'PROFESSOR' && s.workflowStatus === 'CREATED') return false;
        return true;
    });

    const getStatusLabel = (status: string, role: string | undefined) => {
        if (!status) return '---';

        if (role === 'COORDINATOR') {
            switch (status) {
                case 'CREATED': return 'Pendiente de asignar';
                case 'ASSIGNED': return 'Enviado al profesor';
                case 'SUBMITTED': return 'Pendiente de revisión';
                case 'APPROVED': return 'Aprobado';
                case 'RETURNED': return 'Devuelto con observaciones';
                default: return status;
            }
        } else if (role === 'PROFESSOR') {
            switch (status) {
                case 'ASSIGNED': return 'Por completar';
                case 'SUBMITTED': return 'En revisión';
                case 'APPROVED': return 'Aprobado';
                case 'RETURNED': return 'Requiere correcciones';
                default: return status;
            }
        }
        return status;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CREATED': return 'bg-gray-200 text-gray-800';
            case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
            case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'RETURNED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const modalContent = getModalContent();
    const periodOptions = [
        { value: 'all', label: 'TODOS' },
        ...periods.map(p => ({ value: p.id, label: p.name }))
    ];

    return (
        <div className="min-h-screen bg-neo-bg p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black uppercase mb-2 tracking-tighter">
                        Gestión de Sílabos
                    </h1>
                    <p className="text-gray-600 font-medium">
                        Administra y revisa los sílabos de tus cursos.
                    </p>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4 bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full md:w-auto">
                        <NeoSelect
                            label="Periodo"
                            value={selectedPeriod}
                            onChange={(val) => setSelectedPeriod(val === 'all' ? 'all' : Number(val))}
                            options={periodOptions}
                            className="w-full md:w-64"
                        />
                    </div>

                    {user?.role === 'COORDINATOR' && user?.career && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-6 py-3 bg-neo-blue text-white font-black border-2 border-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                <Plus size={24} strokeWidth={3} />
                                NUEVO SÍLABO
                                <ChevronDown size={20} className={`ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50">
                                    <button
                                        onClick={() => {
                                            setIsCreateModalOpen(true);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 font-bold hover:bg-neo-yellow border-b-2 border-transparent hover:border-black flex items-center gap-3 transition-colors text-black"
                                    >
                                        <File size={18} />
                                        Individual
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsBulkModalOpen(true);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 font-bold hover:bg-neo-yellow border-b-2 border-transparent hover:border-black flex items-center gap-3 transition-colors text-black"
                                    >
                                        <Layers size={18} />
                                        Masivo (Excel)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black text-white uppercase font-black text-sm tracking-widest">
                            <tr>
                                <th className="p-4 border-b-4 border-black w-24">Código</th>
                                <th className="p-4 border-b-4 border-black">Curso</th>
                                <th className="p-4 border-b-4 border-black">Periodo</th>
                                <th className="p-4 border-b-4 border-black">Docente</th>
                                <th className="p-4 border-b-4 border-black text-center">Estado</th>
                                <th className="p-4 border-b-4 border-black text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black">
                            {filteredSyllabi.length > 0 ? (
                                filteredSyllabi.map((syllabus) => (
                                    <tr key={syllabus.id} className="hover:bg-neo-yellow transition-colors font-medium">
                                        <td className="p-4 font-bold">{syllabus.courseCode}</td>
                                        <td className="p-4">{syllabus.courseName}</td>
                                        <td className="p-4 uppercase">{syllabus.academicPeriod?.name}</td>
                                        <td className="p-4">{syllabus.professor?.fullName || '---'}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-sm border-2 border-black text-xs font-black uppercase ${getStatusColor(syllabus.workflowStatus)}`}>
                                                {getStatusLabel(syllabus.workflowStatus, user?.role)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {user?.role === 'COORDINATOR' && syllabus.workflowStatus === 'CREATED' && (
                                                    <button
                                                        onClick={() => setConfirmModal({ isOpen: true, syllabus, action: 'ASSIGN', isLoading: false })}
                                                        className="p-2 border-2 border-black bg-neo-green text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                        title="Asignar al Profesor (Enviar)"
                                                    >
                                                        <Send size={18} />
                                                    </button>
                                                )}

                                                {user?.role === 'COORDINATOR' && syllabus.workflowStatus === 'SUBMITTED' && (
                                                    <>
                                                        <button
                                                            onClick={() => setConfirmModal({ isOpen: true, syllabus, action: 'APPROVE', isLoading: false })}
                                                            className="p-2 border-2 border-black bg-neo-green text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                            title="Aprobar Sílabo"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmModal({ isOpen: true, syllabus, action: 'RETURN', isLoading: false })}
                                                            className="p-2 border-2 border-black bg-neo-red text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                            title="Observar y Devolver"
                                                        >
                                                            <RotateCcw size={18} />
                                                        </button>
                                                    </>
                                                )}

                                                {user?.role === 'COORDINATOR' && (
                                                    <button
                                                        onClick={() => handleOpenUpload(syllabus.id)}
                                                        className="p-2 border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                        title="Cargar Excel"
                                                    >
                                                        <FileSpreadsheet size={18} />
                                                    </button>
                                                )}

                                                {user?.role === 'PROFESSOR' && (
                                                    <button
                                                        onClick={() => navigate(`/syllabus/${syllabus.id}/edit`)}
                                                        className="p-2 border-2 border-black bg-neo-yellow text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                        title="Editar Sílabo"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleViewPdf(syllabus.id)}
                                                    className="p-2 border-2 border-black bg-white hover:bg-gray-50 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                    title="Previsualizar PDF"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                {user?.role === 'COORDINATOR' && (
                                                    <button
                                                        onClick={() => setConfirmModal({
                                                            isOpen: true,
                                                            syllabus,
                                                            action: 'DELETE',
                                                            isLoading: false
                                                        })}
                                                        className="p-2 border-2 border-black bg-red-100 hover:bg-red-200 text-neo-red shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                                        No se encontraron sílabos en este periodo.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <CreateSyllabusModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            <BulkCreateSyllabusModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            {uploadSyllabusId && (
                <UploadExcelModal
                    isOpen={isUploadExcelModalOpen}
                    onClose={() => setIsUploadExcelModalOpen(false)}
                    syllabusId={uploadSyllabusId}
                    onSuccess={handleUploadSuccess}
                />
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, syllabus: null, action: null, isLoading: false })}
                onConfirm={handleConfirmAction}
                title={modalContent.title}
                message={modalContent.message}
                confirmText={modalContent.confirmText}
                isLoading={confirmModal.isLoading}
            />
        </div>
    );
};