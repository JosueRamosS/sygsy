import React, { useEffect, useState } from 'react';
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
            borderColor: 'border-gray-600'
        },
        {
            title: user?.role === 'COORDINATOR' ? 'Enviados al profesor' : 'Por completar',
            value: stats.assigned,
            icon: Send,
            color: 'bg-blue-100',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-600'
        },
        {
            title: user?.role === 'COORDINATOR' ? 'Pendiente de revisión' : 'En revisión',
            value: stats.submitted,
            icon: Clock,
            color: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            borderColor: 'border-yellow-600'
        },
        {
            title: 'Aprobados',
            value: stats.approved,
            icon: CheckCircle,
            color: 'bg-green-100',
            iconColor: 'text-green-600',
            borderColor: 'border-green-600'
        },
        {
            title: user?.role === 'COORDINATOR' ? 'Devueltos con observaciones' : 'Requiere correcciones',
            value: stats.returned,
            icon: XCircle,
            color: 'bg-red-100',
            iconColor: 'text-red-600',
            borderColor: 'border-red-600'
        },
    ];

    return (
        <div className="min-h-screen bg-neo-bg p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-black uppercase mb-3 tracking-tighter">
                        ¡Bienvenido/a!
                    </h1>
                    <p className="text-2xl font-bold text-gray-700">
                        {user?.fullName}
                    </p>
                    <p className="text-lg font-medium text-gray-600 mt-1">
                        <span className="bg-black text-white px-3 py-1 rounded-full uppercase text-sm">
                            {getRoleDisplayName(user?.role, user?.career)}
                        </span>
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black uppercase mb-6 tracking-tighter">
                        Estado de tus Sílabos
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {statCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className={`${stat.color} border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer`}
                                    onClick={() => navigate('/syllabi')}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 ${stat.color} border-3 ${stat.borderColor} rounded-lg`}>
                                            <Icon className={`${stat.iconColor}`} size={32} strokeWidth={2.5} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-5xl font-black">{stat.value}</p>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-tight">
                                        {stat.title}
                                    </h3>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-xl font-black uppercase mb-4 tracking-tighter">
                        Accesos Rápidos
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate('/syllabi')}
                            className="px-6 py-3 bg-neo-violet text-white font-bold border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                        >
                            VER TODOS LOS SÍLABOS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
