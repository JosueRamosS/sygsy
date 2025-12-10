import React, { useState, useEffect } from 'react';
import { careerApi } from '../api/careerApi';
import type { Career } from '../api/careerApi';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export const CareersPage = () => {
    const [careers, setCareers] = useState<Career[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCareerName, setNewCareerName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCareers();
    }, []);

    const fetchCareers = async () => {
        try {
            const data = await careerApi.getAll();
            setCareers(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar carreras');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await careerApi.create(newCareerName);
            toast.success('Carrera creada');
            setNewCareerName('');
            setIsModalOpen(false);
            fetchCareers();
        } catch (error) {
            console.error(error);
            toast.error('Error al crear carrera');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Seguro que deseas eliminar esta carrera?')) return;
        try {
            await careerApi.delete(id);
            toast.success('Carrera eliminada');
            fetchCareers();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar carrera');
        }
    };

    return (
        <div className="min-h-screen bg-neo-bg p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Gestión de Carreras</h1>
                        <p className="text-gray-600 font-medium">Administra las carreras profesionales.</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                        <Plus size={20} />
                        NUEVA CARRERA
                    </Button>
                </div>

                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neo-yellow border-b-4 border-black">
                                <tr>
                                    <th className="p-4 font-black uppercase">ID</th>
                                    <th className="p-4 font-black uppercase">Nombre</th>
                                    <th className="p-4 font-black uppercase text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-black">
                                {careers.map((career) => (
                                    <tr key={career.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-mono font-bold">#{career.id}</td>
                                        <td className="p-4 font-bold flex items-center gap-2">
                                            <BookOpen size={18} /> {career.name}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(career.id)}
                                                className="text-neo-red hover:text-red-700 font-bold p-2 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {careers.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-gray-500 font-medium italic">
                                            No hay carreras registradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Carrera">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <Input
                            label="Nombre de la Carrera"
                            value={newCareerName}
                            onChange={(e) => setNewCareerName(e.target.value)}
                            required
                            placeholder="Ej. Ingeniería de Sistemas"
                        />
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                CANCELAR
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'GUARDANDO...' : 'CREAR'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};
