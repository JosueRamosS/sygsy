import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { LogOut, LayoutDashboard, FileText, UserCircle } from 'lucide-react';

export const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-neo-bg">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r-3 border-black flex flex-col fixed h-full z-10">
                <div className="p-6 border-b-3 border-black bg-neo-yellow">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Sygsy</h2>
                    <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">
                        {user?.role}
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Button
                        variant="outline"
                        className="w-full justify-start text-left flex items-center gap-3 border-2"
                        onClick={() => navigate('/dashboard')}
                    >
                        <LayoutDashboard size={20} /> Dashboard
                    </Button>

                    {user?.role === 'COORDINATOR' && (
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left flex items-center gap-3 border-2"
                            onClick={() => navigate('/periods')}
                        >
                            <FileText size={20} /> Periodos
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        className="w-full justify-start text-left flex items-center gap-3 border-2"
                        onClick={() => navigate('/syllabi')}
                    >
                        <BookOpen size={20} /> Sílabos
                    </Button>
                </nav>

                <div className="p-4 border-t-3 border-black bg-gray-50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <UserCircle size={32} />
                        <div className="overflow-hidden">
                            <p className="font-bold truncate text-sm">{user?.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.username}</p>
                        </div>
                    </div>
                    <Button
                        variant="danger"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={logout}
                        size="sm"
                    >
                        <LogOut size={16} /> CERRAR SESIÓN
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
};

import { BookOpen } from 'lucide-react';
