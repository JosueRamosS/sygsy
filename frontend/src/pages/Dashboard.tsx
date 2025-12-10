import { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { syllabusApi } from '../api/syllabusApi';
import type { Syllabus } from '../api/syllabusApi';
import { FileText, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getRoleDisplayName } from '../utils/roleUtils';

export const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);

    useEffect(() => {
        fetchSyllabi();
    }, []);

    const fetchSyllabi = async () => {
        try {
            const data = await syllabusApi.getAll();
            setSyllabi(data);
        } catch (error) {
            console.error('Error fetching syllabi:', error);
            toast.error('Error al cargar sílabos');
        }
    };

    // Calculate statistics
    const stats = {
        created: syllabi.filter(s => s.workflowStatus === 'CREATED').length,
        assigned: syllabi.filter(s => s.workflowStatus === 'ASSIGNED').length,
        submitted: syllabi.filter(s => s.workflowStatus === 'SUBMITTED').length,
        approved: syllabi.filter(s => s.workflowStatus === 'APPROVED').length,
        returned: syllabi.filter(s => s.workflowStatus === 'RETURNED').length,
    };

    const statCards = [
        {
            title: user?.role === 'COORDINATOR' ? 'Pendiente de asignar' : 'Creados',
            value: stats.created,
            icon: FileText,
            color: 'bg-gray-100',
            iconColor: 'text-gray-600',
            borderColor: 'border-gray-600',
            show: user?.role === 'COORDINATOR' // Hide Created for Professors
        },
        {
            title: user?.role === 'COORDINATOR' ? 'Enviados al profesor' : 'Por completar',
            value: stats.assigned,
            icon: Send,
            color: 'bg-blue-100',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-600',
            show: true
        },
        {
            title: user?.role === 'COORDINATOR' ? 'Pendiente de revisión' : 'En revisión',
            value: stats.submitted,
            icon: Clock,
            color: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            borderColor: 'border-yellow-600',
            show: true
        },
        {
            title: 'Aprobados',
            value: stats.approved,
            icon: CheckCircle,
            color: 'bg-green-100',
            iconColor: 'text-green-600',
            borderColor: 'border-green-600',
            show: true
        },
        {
            title: user?.role === 'COORDINATOR' ? 'Devueltos con observaciones' : 'Requiere correcciones',
            value: stats.returned,
            icon: XCircle,
            color: 'bg-red-100',
            iconColor: 'text-red-600',
            borderColor: 'border-red-600',
            show: true
        },
    ];

    const isCoordinator = user?.role === 'COORDINATOR';

    return (
        <div className="min-h-screen bg-neo-bg p-8 font-sans">
            <div className={`${isCoordinator ? 'max-w-[1600px]' : 'max-w-7xl'} mx-auto transition-all duration-300`}>
                {/* Header */}
                <div className="mb-16 text-center md:text-left">
                    <h1 className="text-4xl font-black uppercase mb-3 tracking-tighter">
                        ¡Hola, {user?.fullName?.split(' ')[0]}!
                    </h1>
                    <p className="text-xl font-bold text-gray-600">
                        <span className="bg-black text-white px-5 py-2 rounded-full uppercase text-sm tracking-widest">
                            {getRoleDisplayName(user?.role, user?.career)}
                        </span>
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="mb-4">
                    <div className={`grid grid-cols-1 md:grid-cols-3 ${isCoordinator ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-8`}>
                        {statCards.map((stat, index) => {
                            if (!stat.show) return null;
                            const Icon = stat.icon;

                            return (
                                <div
                                    key={index}
                                    className={`${stat.color} border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all group rounded-sm flex flex-col justify-between min-h-[300px]`}
                                >
                                    {/* Top Row: Icon Box + Title */}
                                    <div className="flex flex-col items-start gap-4">
                                        <div className={`p-3 bg-white border-2 border-black rounded-md group-hover:bg-black group-hover:text-white transition-colors shrink-0`}>
                                            <Icon size={36} strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-lg font-black uppercase tracking-tight leading-none">
                                            {stat.title}
                                        </h3>
                                    </div>

                                    {/* Bottom: Number (Right Aligned - ABSOLUTELY MASSIVE) */}
                                    <div className="text-right mt-auto">
                                        <p className="text-[9rem] font-black tracking-tighter leading-[0.8]">{stat.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex justify-center mt-20 pb-12">
                    <button
                        onClick={() => navigate('/syllabi')}
                        className="px-16 py-5 bg-neo-violet text-white font-black text-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all uppercase tracking-widest rounded-sm transform hover:scale-105"
                    >
                        VER TODOS
                    </button>
                </div>
            </div>
        </div>
    );
};
