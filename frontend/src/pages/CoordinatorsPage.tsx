import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import { careerApi } from '../api/careerApi';
import type { User } from '../types/auth';
import type { Career } from '../api/careerApi';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { NeoSelect } from '../components/ui/NeoSelect';
import { Plus, Shield, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRoleDisplayName } from '../utils/roleUtils';

export const CoordinatorsPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        career: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchCareers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userApi.getAll();
            // Filter only Coordinators (excluding Admin who has no career)
            const coords = data.filter(u => u.role === 'COORDINATOR' && u.career);
            setUsers(coords);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar coordinadores');
        }
    };

    const fetchCareers = async () => {
        try {
            const data = await careerApi.getAll();
            setCareers(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar carreras');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Create user as COORDINATOR
            await userApi.create({
                ...formData,
                role: 'COORDINATOR'
            });
            toast.success('Coordinador creado correctamente');
            fetchUsers();
            setIsModalOpen(false);
            setFormData({ username: '', password: '', fullName: '', career: '' });
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error al crear usuario';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const careerOptions = careers.map(c => ({ value: c.name, label: c.name }));

    return (
        <div className="min-h-screen bg-neo-bg p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Gestión de Coordinadores</h1>
                        <p className="text-gray-600 font-medium">Administra los coordinadores de cada carrera.</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                        <Plus size={20} />
                        NUEVO COORDINADOR
                    </Button>
                </div>

                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neo-yellow border-b-4 border-black">
                                <tr>
                                    <th className="p-4 font-black uppercase">Usuario</th>
                                    <th className="p-4 font-black uppercase">Nombre</th>
                                    <th className="p-4 font-black uppercase">Rol</th>
                                    <th className="p-4 font-black uppercase">Carrera</th>
                                    <th className="p-4 font-black uppercase">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-black">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-mono">{user.username}</td>
                                        <td className="p-4 font-bold">{user.fullName}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black uppercase border border-black bg-neo-blue text-white">
                                                <Shield size={12} />
                                                {getRoleDisplayName(user.role, user.career)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {user.career && (
                                                <span className="inline-flex items-center gap-1 text-sm font-bold">
                                                    <Briefcase size={14} />
                                                    {user.career}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-block w-3 h-3 bg-green-500 rounded-full border border-black"></span>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500 font-medium italic">
                                            No hay coordinadores registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Coordinador">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Correo (Usuario)"
                            type="email"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                        <Input
                            label="Nombre Completo"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                        />
                        <Input
                            label="Contraseña"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />

                        <NeoSelect
                            label="Carrera (Obligatorio)"
                            value={formData.career}
                            onChange={(val) => setFormData({ ...formData, career: String(val) })}
                            options={careerOptions}
                            placeholder="Seleccione una carrera..."
                        />
                        {!formData.career && <p className="text-xs text-red-500 font-bold">* Selecciona una carrera.</p>}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                CANCELAR
                            </Button>
                            <Button type="submit" disabled={isLoading || !formData.career}>
                                {isLoading ? 'GUARDANDO...' : 'CREAR'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};
