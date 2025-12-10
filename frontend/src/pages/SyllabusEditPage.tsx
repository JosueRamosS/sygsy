import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { syllabusApi } from '../api/syllabusApi';
import type { Syllabus, SyllabusUnit, SyllabusEvaluation } from '../api/syllabusApi';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ArrowLeft, Save, Send, BookOpen, List, CheckSquare, Settings, Book, ChevronDown, ChevronRight, Activity, FileStack, Calendar, Lightbulb, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

type Section = 'general' | 'comp_course' | 'comp_profile' | 'comp_previous' | 'sumilla' | 'unit_1' | 'unit_2' | 'unit_3' | 'unit_4' | 'bibliography' | 'activities' | 'eval_add' | string;

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    children?: { id: Section; label: string }[];
}

// Helper for Auto-Resizing Textarea
const AutoResizeTextarea = ({ value, onChange, placeholder, className, rows = 3, ...props }: { value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder?: string, className?: string, rows?: number, name?: string }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`resize-none overflow-hidden transition-all ${className}`}
            {...props}
        />
    );
};

export const SyllabusEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [sending, setSending] = useState(false);
    const [activeSection, setActiveSection] = useState<Section>('general');
    const [expandedMenu, setExpandedMenu] = useState<string | null>('evaluations');
    const [showConfirmSend, setShowConfirmSend] = useState(false);

    useEffect(() => {
        if (id) fetchSyllabus(Number(id));
    }, [id]);

    const fetchSyllabus = async (syllabusId: number) => {
        try {
            const data = await syllabusApi.getById(syllabusId);
            if (data.units) data.units.sort((a, b) => a.unitNumber - b.unitNumber);

            // Initialize standard evaluations if empty
            if (!data.evaluations || data.evaluations.length === 0) {
                data.evaluations = [
                    { id: Date.now(), name: 'Consolidado 1', consolidationDate: '', description: '' },
                    { id: Date.now() + 1, name: 'Examen Parcial', consolidationDate: '', description: '' },
                    { id: Date.now() + 2, name: 'Consolidado 2', consolidationDate: '', description: '' },
                    { id: Date.now() + 3, name: 'Examen Final', consolidationDate: '', description: '' },
                ];
            }
            setSyllabus(data);
        } catch (error) {
            toast.error('Error al cargar el sílabo');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (silent = false) => {
        if (!syllabus) return false;
        setSaving(true);
        try {
            await syllabusApi.update(syllabus.id, syllabus);
            if (!silent) toast.success('Cambios guardados');
            return true;
        } catch (error) {
            toast.error('Error al guardar');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleSendClick = () => {
        setShowConfirmSend(true);
    }

    const handleConfirmSend = async () => {
        if (!syllabus) return;
        setSending(true);
        try {
            // Save first
            await syllabusApi.update(syllabus.id, syllabus);

            // Then update status separately
            await syllabusApi.updateStatus(syllabus.id, 'SUBMITTED');

            toast.success('Sílabo enviado correctamente');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Error al enviar el sílabo');
            console.error(error);
        } finally {
            setSending(false);
            setShowConfirmSend(false);
        }
    };

    const handlePreview = async () => {
        setPreviewing(true);
        const saved = await handleSave(true);
        if (saved && syllabus) {
            try {
                const blob = await syllabusApi.getPdf(syllabus.id);
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
            } catch (error) {
                toast.error('Error al generar PDF');
            }
        }
        setPreviewing(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (!syllabus) return;
        setSyllabus({ ...syllabus, [e.target.name]: e.target.value });
    };

    const handleUnitChange = (unitIndex: number, field: keyof SyllabusUnit, value: string) => {
        if (!syllabus || !syllabus.units) return;
        const newUnits = [...syllabus.units];
        newUnits[unitIndex] = { ...newUnits[unitIndex], [field]: value };
        setSyllabus({ ...syllabus, units: newUnits });
    };

    const handleEvalChange = (id: number, field: keyof SyllabusEvaluation, value: any) => {
        if (!syllabus || !syllabus.evaluations) return;
        const newEvals = syllabus.evaluations.map(e => e.id === id ? { ...e, [field]: value } : e);
        setSyllabus({ ...syllabus, evaluations: newEvals });
    };

    const getActiveEvaluation = () => {
        if (!syllabus?.evaluations || !activeSection.startsWith('eval_')) return null;
        const id = parseInt(activeSection.split('_')[1]);
        return syllabus.evaluations.find(e => e.id === id);
    };

    const toggleMenu = (itemId: string) => {
        setExpandedMenu(expandedMenu === itemId ? null : itemId);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-2xl">CARGANDO EDITOR...</div>;
    if (!syllabus) return <div>Sílabo no encontrado</div>;

    // DYNAMIC NAVIGATION
    const navItems: NavItem[] = [
        { id: 'general', label: 'DATOS GENERALES', icon: <Settings size={18} /> },
        {
            id: 'competences',
            label: 'COMPETENCIAS',
            icon: <BookOpen size={18} />,
            children: [
                { id: 'comp_course', label: 'Competencia del Curso' },
                { id: 'comp_profile', label: 'Perfil de Egreso' },
                { id: 'comp_previous', label: 'Competencias Previas' },
            ]
        },
        { id: 'sumilla', label: 'SUMILLA', icon: <FileStack size={18} /> },
        {
            id: 'units',
            label: 'UNIDADES',
            icon: <List size={18} />,
            children: [
                { id: 'unit_1', label: 'Unidad I' },
                { id: 'unit_2', label: 'Unidad II' },
                { id: 'unit_3', label: 'Unidad III' },
                { id: 'unit_4', label: 'Unidad IV' },
            ]
        },
        { id: 'bibliography', label: 'BIBLIOGRAFÍA', icon: <Book size={18} /> },
        { id: 'activities', label: 'ACTIVIDADES', icon: <Activity size={18} /> },
        {
            id: 'evaluations',
            label: 'EVALUACIÓN',
            icon: <CheckSquare size={18} />,
            children: [
                ...(syllabus.evaluations?.map((ev, idx) => ({
                    id: `eval_${ev.id}`,
                    label: ev.name || `Evaluación ${idx + 1}`
                })) || []),
            ]
        },
    ];

    return (
        <div className="flex flex-col h-screen bg-neo-bg">
            <div className="h-16 bg-white border-b-3 border-black flex justify-between items-center px-4 md:px-6 shadow-sm z-20 sticky top-0">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/dashboard')} className="p-2 h-10 w-10 flex items-center justify-center bg-white">
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="hidden md:block">
                        <h1 className="text-lg md:text-xl font-black uppercase text-neo-violet truncate max-w-md leading-tight">
                            {syllabus.courseName}
                        </h1>
                        <p className="text-xs font-bold text-gray-500 uppercase">{syllabus.courseCode}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handlePreview} disabled={previewing || saving || sending} className="bg-neo-blue text-white border-2 border-black flex gap-2 items-center hover:brightness-110 h-10 text-sm md:text-base">
                        <Eye size={18} /> <span className="hidden md:inline">{previewing ? 'Generando...' : 'PREVISUALIZAR'}</span>
                    </Button>
                    <Button onClick={() => handleSave(false)} disabled={saving || sending} className="bg-white text-black border-2 border-black flex gap-2 items-center hover:bg-gray-100 h-10 text-sm md:text-base font-bold">
                        <Save size={18} /> <span className="hidden md:inline">{saving ? 'Guardando...' : 'GUARDAR'}</span>
                    </Button>
                    <Button onClick={handleSendClick} disabled={sending || saving} variant="secondary" className="bg-neo-green flex gap-2 items-center text-black h-10 text-sm md:text-base border-2 border-black">
                        <Send size={18} /> <span className="hidden md:inline">{sending ? 'ENVIANDO...' : 'ENVIAR'}</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r-3 border-black overflow-y-auto flex-shrink-0 flex flex-col pb-20">
                    <div className="p-4">
                        <h2 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-wider">Navegación</h2>
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <div key={item.id} className="mb-2">
                                    {item.children ? (
                                        <div className="flex flex-col">
                                            <button
                                                onClick={() => toggleMenu(item.id)}
                                                className={`
                                                    w-full flex items-center justify-between px-3 py-3 text-sm font-bold border-2 transition-all mb-1
                                                    ${expandedMenu === item.id ? 'bg-gray-100 border-black' : 'bg-white border-transparent hover:bg-gray-50'}
                                                `}
                                            >
                                                <div className="flex items-center gap-2 flex-1 text-left">
                                                    <span className="shrink-0">{item.icon}</span>
                                                    <span className="leading-tight">{item.label}</span>
                                                </div>
                                                {expandedMenu === item.id ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight size={16} className="shrink-0" />}
                                            </button>

                                            {expandedMenu === item.id && (
                                                <div className="ml-4 pl-2 border-l-2 border-gray-200 space-y-1">
                                                    {item.children.map((child) => (
                                                        <button
                                                            key={child.id}
                                                            onClick={() => setActiveSection(child.id)}
                                                            className={`
                                                                w-full text-left px-3 py-2 text-xs font-bold border-2 transition-all
                                                                ${activeSection === child.id
                                                                    ? 'bg-neo-yellow border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                                    : 'bg-white border-transparent hover:bg-gray-50 text-gray-600'}
                                                            `}
                                                        >
                                                            {child.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setActiveSection(item.id as Section)}
                                            className={`
                                                w-full flex items-center gap-3 px-3 py-3 text-sm font-bold border-2 transition-all
                                                ${activeSection === item.id
                                                    ? 'bg-neo-yellow border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]'
                                                    : 'bg-white border-transparent hover:bg-gray-100 text-gray-700'}
                                            `}
                                        >
                                            <span className="shrink-0">{item.icon}</span>
                                            <span className="text-left leading-tight">{item.label}</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-neo-bg">
                    <div className="max-w-5xl mx-auto h-full pb-20">
                        {/* SECTIONS */}
                        {activeSection === 'general' && (
                            <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 border-b-2 border-black pb-2">
                                    <Settings className="text-neo-blue" /> DATOS GENERALES
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <ViewField label="Facultad" value={syllabus.faculty} />
                                    <ViewField label="Programa Profesional" value={syllabus.career} />
                                    <ViewField label="Periodo Lectivo" value={syllabus.academicPeriod?.name} />
                                    <ViewField label="Semestre" value={syllabus.semester} />
                                    <ViewField label="Código Curso" value={syllabus.courseCode} />
                                    <ViewField label="Nombre Curso" value={syllabus.courseName} />
                                    <ViewField label="Créditos" value={syllabus.credits?.toString()} />
                                    <ViewField label="Área de Formación" value={syllabus.trainingArea} />
                                    <ViewField label="Tipo de Curso" value={syllabus.courseType} />
                                    <ViewField label="Horas Teoría / Práctica" value={`${syllabus.theoryHours} / ${syllabus.practiceHours}`} />
                                    <ViewField label="Prerrequisitos" value={syllabus.prerequisites} />
                                    <div className="md:col-span-2 pt-4 border-t-2 border-dashed border-gray-300">
                                        <ViewField label="Docente Responsable" value={syllabus.professor?.fullName} active />
                                    </div>
                                </div>
                            </Card>
                        )}

                        {activeSection === 'comp_course' && (
                            <SectionEditor title="Competencia del Curso" description="Describe la competencia principal que el estudiante desarrollará al finalizar el curso." icon={<BookOpen className="text-neo-pink" />}>
                                <AutoResizeTextarea name="courseCompetence" value={syllabus.courseCompetence || ''} onChange={handleInputChange} rows={6} className="w-full text-lg p-4 border-3 border-black font-medium focus:shadow-neo outline-none transition-shadow bg-yellow-50" placeholder="Escribe aquí la competencia del curso..." />
                            </SectionEditor>
                        )}

                        {activeSection === 'comp_profile' && (
                            <SectionEditor title="Competencia del Perfil de Egreso" description="Indica a cuál(es) competencia(s) del perfil de egreso contribuye este curso." icon={<BookOpen className="text-neo-pink" />}>
                                <AutoResizeTextarea name="profileCompetence" value={syllabus.profileCompetence || ''} onChange={handleInputChange} rows={6} className="w-full text-lg p-4 border-3 border-black font-medium focus:shadow-neo outline-none transition-shadow bg-yellow-50" placeholder="Escribe aquí la competencia del perfil..." />
                            </SectionEditor>
                        )}

                        {activeSection === 'comp_previous' && (
                            <SectionEditor title="Competencias Previas" description="Conocimientos y habilidades que el estudiante debe poseer antes de iniciar el curso." icon={<BookOpen className="text-neo-pink" />}>
                                <AutoResizeTextarea name="previousCompetence" value={syllabus.previousCompetence || ''} onChange={handleInputChange} rows={5} className="w-full text-lg p-4 border-3 border-black font-medium focus:shadow-neo outline-none transition-shadow bg-yellow-50" placeholder="Escribe aquí las competencias previas..." />
                            </SectionEditor>
                        )}

                        {activeSection === 'sumilla' && (
                            <SectionEditor title="Sumilla" description="Descripción breve y sintética del contenido del curso." icon={<FileStack className="text-neo-blue" />}>
                                <AutoResizeTextarea name="sumilla" value={syllabus.sumilla || ''} onChange={handleInputChange} rows={8} className="w-full text-lg p-4 border-3 border-black font-medium focus:shadow-neo outline-none transition-shadow bg-yellow-50" placeholder="Escribe aquí la sumilla..." />
                            </SectionEditor>
                        )}

                        {/* UNITS 1-4 */}
                        {['unit_1', 'unit_2', 'unit_3', 'unit_4'].includes(activeSection) && syllabus.units && (
                            <UnitEditor unitIndex={parseInt(activeSection.split('_')[1]) - 1} unit={syllabus.units[parseInt(activeSection.split('_')[1]) - 1]} onUnitChange={handleUnitChange} />
                        )}

                        {activeSection === 'bibliography' && (
                            <SectionEditor title="Bibliografía" description="Referencias bibliográficas base y complementarias." icon={<Book className="text-neo-violet" />}>
                                <AutoResizeTextarea name="bibliography" value={syllabus.bibliography || ''} onChange={handleInputChange} rows={10} className="w-full text-lg p-4 border-3 border-black font-medium focus:shadow-neo outline-none transition-shadow bg-yellow-50" placeholder="Escribe aquí la bibliografía del curso..." />
                            </SectionEditor>
                        )}

                        {activeSection === 'activities' && (
                            <SectionEditor title="Actividades" description="Actividades principales a realizar en el curso." icon={<Activity className="text-orange-500" />}>
                                <AutoResizeTextarea name="activities" value={syllabus.activities || ''} onChange={handleInputChange} rows={6} className="w-full text-lg p-4 border-3 border-black font-medium focus:shadow-neo outline-none transition-shadow bg-yellow-50" placeholder="Escribe aquí las actividades..." />
                            </SectionEditor>
                        )}

                        {/* DYNAMIC EVALUATION EDITOR */}
                        {activeSection.startsWith('eval_') && (() => {
                            const activeEval = getActiveEvaluation();
                            if (!activeEval) return <div>Evaluación no encontrada.</div>;
                            return (
                                <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300 relative border-l-8 border-neo-red">
                                    <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                                        <CheckSquare className="text-neo-red" /> {activeEval.name || 'Nueva Evaluación'}
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-black uppercase mb-2">Nombre de la Evaluación</label>
                                            <input
                                                type="text"
                                                value={activeEval.name}
                                                onChange={(e) => handleEvalChange(activeEval.id, 'name', e.target.value)}
                                                className="w-full md:w-1/2 p-3 border-3 border-black font-bold text-lg focus:shadow-neo outline-none bg-yellow-50"
                                                placeholder="Ej: Evaluación de Entrada"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 max-w-xs">
                                                <label className="block text-xs font-black uppercase mb-2">Hasta:</label>
                                                <input
                                                    type="date"
                                                    value={activeEval.consolidationDate || ''}
                                                    onChange={(e) => handleEvalChange(activeEval.id, 'consolidationDate', e.target.value)}
                                                    className="w-full p-3 border-3 border-black font-medium focus:shadow-neo outline-none bg-yellow-50"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase mb-2">Descripción / Contenido</label>
                                            <AutoResizeTextarea
                                                value={activeEval.description || ''}
                                                onChange={(e) => handleEvalChange(activeEval.id, 'description', e.target.value)}
                                                rows={4}
                                                className="w-full p-4 border-3 border-black font-medium focus:shadow-neo outline-none bg-yellow-50"
                                                placeholder="Describe en qué consiste esta evaluación..."
                                            />
                                        </div>
                                    </div>
                                </Card>
                            );
                        })()}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmSend}
                onClose={() => setShowConfirmSend(false)}
                onConfirm={handleConfirmSend}
                title="Confirmar Envío"
                message="¿Estás seguro de enviar el sílabo? Pasará a estado de Revisión y no podrás editarlo hasta recibir respuesta."
                confirmText="ENVIAR"
                isLoading={sending}
            />
        </div>
    );
};

// --- SUB-COMPONENTS ---
const ViewField = ({ label, value, active = false }: { label: string, value: string | undefined, active?: boolean }) => (
    <div className={active ? "bg-neo-yellow p-2 border-2 border-black" : ""}>
        <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</label>
        <p className="font-bold text-base md:text-lg text-gray-900 leading-tight">{value || '---'}</p>
    </div>
);

const SectionEditor = ({ title, description, icon, children }: { title: string, description: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300 relative">
        <div className="mb-6">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                {icon} {title}
            </h2>
            <p className="text-gray-500 font-medium mt-1 ml-7">{description}</p>
        </div>
        {children}
    </Card>
);

const UnitEditor = ({ unitIndex, unit, onUnitChange }: { unitIndex: number, unit: SyllabusUnit, onUnitChange: (idx: number, field: keyof SyllabusUnit, val: string) => void }) => {
    if (!unit) return <div>Unidad no inicializada</div>;
    const roman = ['I', 'II', 'III', 'IV'][unitIndex];
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="p-6 md:p-8 border-l-8 border-neo-green">
                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                    <List className="text-neo-green" /> UNIDAD {roman}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-black uppercase mb-2">Contenido General de la Unidad</label>
                        <input type="text" value={unit.content || ''} onChange={(e) => onUnitChange(unitIndex, 'content', e.target.value)} className="w-full p-3 border-3 border-black font-bold focus:shadow-neo outline-none bg-yellow-50" placeholder="Ej: Introducción a la Ingeniería..." />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase mb-2 flex items-center gap-1"><Calendar size={14} /> Fecha Inicio</label>
                        <input type="date" value={unit.startDate || ''} onChange={(e) => onUnitChange(unitIndex, 'startDate', e.target.value)} className="w-full p-3 border-3 border-black font-medium focus:shadow-neo outline-none bg-yellow-50" />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase mb-2 flex items-center gap-1"><Calendar size={14} /> Fecha Fin</label>
                        <input type="date" value={unit.endDate || ''} onChange={(e) => onUnitChange(unitIndex, 'endDate', e.target.value)} className="w-full p-3 border-3 border-black font-medium focus:shadow-neo outline-none bg-yellow-50" />
                    </div>
                </div>
            </Card>
            <Card className="p-6 md:p-8">
                <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                    <List size={20} /> Contenidos Específicos por Semana
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((weekNum) => {
                        const field = `week${weekNum}Content` as keyof SyllabusUnit;
                        return (
                            <div key={weekNum} className="flex gap-4 items-start">
                                <div className="hidden md:flex flex-col items-center justify-center w-12 h-12 bg-black text-white shrink-0 mt-1 font-black border-2 border-neo-yellow">
                                    <span className="text-[10px] uppercase">SEM</span>
                                    <span className="text-xl leading-none">{weekNum}</span>
                                </div>
                                <div className="flex-1">
                                    <label className="block md:hidden text-xs font-black uppercase mb-1">Semana {weekNum}</label>
                                    <AutoResizeTextarea value={String(unit[field] || '')} onChange={(e) => onUnitChange(unitIndex, field, e.target.value)} rows={2} className="w-full p-3 border-2 border-black font-medium focus:shadow-neo outline-none bg-yellow-50" placeholder={`Contenido específico de la semana ${weekNum}...`} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
            <Card className="p-6 md:p-8">
                <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
                    <Lightbulb size={20} className="text-neo-yellow" /> Estrategias Metodológicas
                </h3>
                <AutoResizeTextarea value={unit.methodology || ''} onChange={(e) => onUnitChange(unitIndex, 'methodology', e.target.value)} rows={4} className="w-full p-4 border-3 border-black font-medium focus:shadow-neo outline-none bg-yellow-50" placeholder="Describa las estrategias metodológicas para esta unidad..." />
            </Card>
        </div>
    );
};
