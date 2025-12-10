import React, { useState, useEffect } from 'react';
import { periodApi } from '../api/periodApi';
import type { AcademicPeriod } from '../api/periodApi';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Plus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export const PeriodsPage = () => {
    const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        try {
            const data = await periodApi.getAll();
            setPeriods(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar semestres');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await periodApi.create(formData);
            toast.success('Semestre creado correctamente');
            fetchPeriods();
            setIsModalOpen(false);
            setFormData({ name: '', startDate: '', endDate: '' });
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error al crear semestre';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neo-bg p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Gestión de Semestres</h1>
                        <p className="text-gray-600 font-medium">Administra los periodos académicos del sistema.</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                        <Plus size={20} />
                        NUEVO SEMESTRE
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {periods.map((period) => (
                        <div key={period.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar size={28} className="text-neo-blue" />
                                <h2 className="text-2xl font-black uppercase">{period.name}</h2>
                            </div>
                            <div className="space-y-2 text-sm font-medium">
                                <div className="flex justify-between border-b-2 border-black pb-2">
                                    <span className="text-gray-600 font-bold">Inicio</span>
                                    <span className="font-bold">{period.startDate}</span>
                                </div>
                                <div className="flex justify-between border-b-2 border-black pb-2">
                                    <span className="text-gray-600 font-bold">Fin</span>
                                    <span className="font-bold">{period.endDate}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {periods.length === 0 && (
                        <div className="col-span-full bg-white border-4 border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
                            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500 font-bold text-lg">No hay semestres registrados.</p>
                            <p className="text-gray-400 font-medium mt-2">Crea uno nuevo para empezar.</p>
                        </div>
                    )}
                </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Semestre">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nombre (Ej. 2025-I)"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="2025-I"
                        />
                        <Input
                            label="Fecha Inicio"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                        />
                        <Input
                            label="Fecha Fin"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                CANCELAR
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'GUARDANDO...' : 'CREAR SEMESTRE'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};
