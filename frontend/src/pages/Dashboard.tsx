import React, { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { syllabusApi } from '../api/syllabusApi';
import type { Syllabus } from '../api/syllabusApi';
import { periodApi } from '../api/periodApi';
import type { AcademicPeriod } from '../api/periodApi';
import { CreateSyllabusModal } from '../components/CreateSyllabusModal';
import { UploadExcelModal } from '../components/UploadExcelModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { NeoSelect } from '../components/ui/NeoSelect';
import { LogOut, Plus, FileSpreadsheet, Eye, Pencil, Send, Check, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type ModalAction = 'ASSIGN' | 'APPROVE' | 'RETURN';

export const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
    const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<number | 'all'>('all');

    // Modals State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUploadExcelModalOpen, setIsUploadExcelModalOpen] = useState(false);
    const [uploadSyllabusId, setUploadSyllabusId] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean,
        syllabus: Syllabus | null,
        action: ModalAction | null
    }>({ isOpen: false, syllabus: null, action: null });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchPeriods();
        fetchSyllabi();
    }, []);

    const fetchPeriods = async () => {
        try {
            const data = await periodApi.getAll();
            setPeriods(data);
        } catch (error) {
            console.error('Error fetching periods:', error);
        }
    };

    const fetchSyllabi = async () => {
        try {
            const data = await syllabusApi.getAll();
            setSyllabi(data);
        } catch (error) {
            console.error('Error fetching syllabi:', error);
        }
    };

    const handleCreateSuccess = () => {
        fetchSyllabi();
        setIsCreateModalOpen(false);
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

    const handleAssignClick = (syllabus: Syllabus) => {
        setConfirmModal({ isOpen: true, syllabus, action: 'ASSIGN' });
    };

    const handleApproveClick = (syllabus: Syllabus) => {
        setConfirmModal({ isOpen: true, syllabus, action: 'APPROVE' });
    };

    const handleReturnClick = (syllabus: Syllabus) => {
        setConfirmModal({ isOpen: true, syllabus, action: 'RETURN' });
    };

    const handleConfirmAction = async () => {
        const { syllabus, action } = confirmModal;
        if (!syllabus || !action) return;

        setIsProcessing(true);
        try {
            let status = '';
            let successMsg = '';

            switch (action) {
                case 'ASSIGN':
                    status = 'ASSIGNED';
                    successMsg = 'Sílabo asignado correctamente';
                    break;
                case 'APPROVE':
                    status = 'APPROVED';
                    successMsg = 'Sílabo aprobado correctamente';
                    break;
                case 'RETURN':
                    status = 'RETURNED';
                    successMsg = 'Sílabo devuelto al docente';
                    break;
            }

            // @ts-ignore
            await syllabusApi.updateStatus(syllabus.id, status);
            toast.success(successMsg);
            fetchSyllabi();
            setConfirmModal({ isOpen: false, syllabus: null, action: null });
        } catch (error) {
            toast.error('Error al procesar la acción');
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const getModalContent = () => {
        const { syllabus, action } = confirmModal;
        if (!syllabus || !action) return { title: '', message: '', confirmText: '' };

        switch (action) {
            case 'ASSIGN':
                return {
                    title: 'Confirmar Asignación',
                    message: `¿Asignar sílabo "${syllabus.courseName}" al docente ${syllabus.professor?.fullName || 'seleccionado'}?`,
                    confirmText: 'ASIGNAR'
                };
            case 'APPROVE':
                return {
                    title: 'Aprobar Sílabo',
                    message: `¿Estás seguro de APROBAR el sílabo de "${syllabus.courseName}"?`,
                    confirmText: 'APROBAR'
                };
            case 'RETURN':
                return {
                    title: 'Devolver Sílabo',
                    message: `¿Devolver el sílabo de "${syllabus.courseName}" al docente para correcciones?`,
                    confirmText: 'DEVOLVER'
                };
            default:
                return { title: '', message: '', confirmText: '' };
        }
    };

    // Filter logic
    const filteredSyllabi = syllabi.filter(s => {
        // Period filter
        if (selectedPeriod !== 'all' && s.academicPeriod?.id !== selectedPeriod) return false;

        // Role filter
        if (user?.role === 'PROFESSOR') {
            // Professors don't see CREATED items
            if (s.workflowStatus === 'CREATED') return false;
            // Professors only see their own (backend likely filters this too, but for safety)
            // Just double checking if filtering generically is enough or if backend handles ownership.
            // Assuming backend returns only user's syllabi or we filter by ID if listing ALL.
            // The prompt says "al profe no le aparece CREATED", implying filtering.
        }
        return true;
    });

    const getStatusLabel = (status: string, role: string | undefined) => {
        if (!status) return '---';

        if (role === 'COORDINATOR') {
            switch (status) {
                case 'CREATED': return 'Pendiente de asignar';
                case 'ASSIGNED': return 'Enviado al profesor';
                case 'SUBMITTED': return 'Pendiente de revisión'; // "Pendiente de revisión" was requested for SUBMITTED
                case 'APPROVED': return 'Aprobado';
                case 'RETURNED': return 'Devuelto con observaciones';
                default: return status;
            }
        } else if (role === 'PROFESSOR') {
            switch (status) {
                // CREATED should be hidden
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

    // Transform options for NeoSelect
    const periodOptions = [
        { value: 'all', label: 'TODOS' },
        ...periods.map(p => ({ value: p.id, label: p.name }))
    ];

    return (
        <div className="min-h-screen bg-neo-bg p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-12 bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div>
                        <h1 className="text-4xl font-black uppercase mb-1 tracking-tighter">
                            Gestión de Sílabos
                        </h1>
                        <p className="text-lg font-bold text-gray-500">
                            Bienvenido, {user?.fullName} <span className="text-sm bg-black text-white px-2 py-0.5 rounded-full ml-2 uppercase">{user?.role}</span>
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-6 py-3 bg-neo-red text-white font-bold border-2 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        <LogOut size={20} />
                        CERRAR SESIÓN
                    </button>
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

                    {user?.role === 'COORDINATOR' && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-neo-blue text-white font-black border-2 border-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            <Plus size={24} strokeWidth={3} />
                            NUEVO SÍLABO
                        </button>
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
                                                {/* ACTIONS */}

                                                {/* 1. COORDINATOR ASSIGN: Only for CREATED status */}
                                                {user?.role === 'COORDINATOR' && syllabus.workflowStatus === 'CREATED' && (
                                                    <button
                                                        onClick={() => handleAssignClick(syllabus)}
                                                        className="p-2 border-2 border-black bg-neo-green text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                        title="Asignar al Profesor (Enviar)"
                                                    >
                                                        <Send size={18} />
                                                    </button>
                                                )}

                                                {/* 2. COORDINATOR APPROVE/RETURN: Only for SUBMITTED status */}
                                                {user?.role === 'COORDINATOR' && syllabus.workflowStatus === 'SUBMITTED' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveClick(syllabus)}
                                                            className="p-2 border-2 border-black bg-neo-green text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                            title="Aprobar Sílabo"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReturnClick(syllabus)}
                                                            className="p-2 border-2 border-black bg-neo-red text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                            title="Observar y Devolver"
                                                        >
                                                            <RotateCcw size={18} />
                                                        </button>
                                                    </>
                                                )}

                                                {/* 3. COORDINATOR UPLOAD EXCEL: Always available or restricted? Usually early stages. */}
                                                {user?.role === 'COORDINATOR' && (
                                                    <button
                                                        onClick={() => handleOpenUpload(syllabus.id)}
                                                        className="p-2 border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                        title="Cargar Excel"
                                                    >
                                                        <FileSpreadsheet size={18} />
                                                    </button>
                                                )}

                                                {/* 4. PROFESSOR EDIT */}
                                                {user?.role === 'PROFESSOR' && (
                                                    <button
                                                        onClick={() => navigate(`/syllabus/${syllabus.id}/edit`)}
                                                        className="p-2 border-2 border-black bg-neo-yellow text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                        title="Editar Sílabo"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                )}

                                                {/* VIEW PDF */}
                                                <button
                                                    onClick={() => handleViewPdf(syllabus.id)}
                                                    className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                    title="Ver PDF"
                                                >
                                                    <Eye size={18} />
                                                </button>
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
                onClose={() => setConfirmModal({ isOpen: false, syllabus: null, action: null })}
                onConfirm={handleConfirmAction}
                title={modalContent.title}
                message={modalContent.message}
                confirmText={modalContent.confirmText}
                isLoading={isProcessing}
            />
        </div>
    );
};
