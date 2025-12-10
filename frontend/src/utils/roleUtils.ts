export const getRoleDisplayName = (role: string | undefined, career?: string | null): string => {
    if (!role) return '';

    // Admin check: Coordinator without career
    if (role === 'COORDINATOR' && !career) {
        return 'Administrador/a';
    }

    switch (role) {
        case 'COORDINATOR':
            return 'Coordinador/a';
        case 'PROFESSOR':
            return 'Docente';
        default:
            return role;
    }
};
