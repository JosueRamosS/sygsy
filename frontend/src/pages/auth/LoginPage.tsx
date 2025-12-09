import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login({ username, password });
            navigate('/dashboard'); // Navigation handled by role in App.tsx typically, or redirect here
        } catch (error) {
            // Error handled by AuthContext toast
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neo-bg flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-neo-yellow border-3 border-black shadow-neo mb-4 rounded-full">
                        <BookOpen size={40} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Sygsy</h1>
                    <p className="text-lg font-medium text-gray-600">Gestión de Sílabos</p>
                </div>

                <Card className="transform rotate-1 hover:rotate-0 transition-transform duration-300">
                    <h2 className="text-2xl font-bold mb-6 border-b-3 border-black pb-2">INICIAR SESIÓN</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Usuario / Correo"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin@ulasalle.edu.pe"
                            required
                        />

                        <Input
                            label="Contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                            size="lg"
                        >
                            {isLoading ? 'Ingresando...' : 'INGRESAR'}
                        </Button>
                    </form>
                </Card>

                <p className="text-center mt-8 text-sm font-bold text-gray-500">
                    UNIVERSIDAD LA SALLE © 2025
                </p>
            </div>
        </div>
    );
};
