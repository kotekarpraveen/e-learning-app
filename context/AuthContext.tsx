
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { applyTheme } from '../lib/theme';
import { setCurrency } from '../lib/currency';
import { MOCK_USER_STUDENT, MOCK_USER_ADMIN } from '../constants';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, role: UserRole) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper to map Supabase User to App User
    const mapSupabaseUser = (sbUser: any): User => {
        const metadataRole = sbUser.user_metadata?.role;
        const emailRole = sbUser.email?.includes('admin') ? 'admin' : sbUser.email?.includes('instructor') ? 'instructor' : 'student';
        let finalRole: UserRole = 'student';

        if (['super_admin', 'admin', 'sub_admin', 'viewer', 'approver', 'instructor'].includes(metadataRole)) {
            finalRole = metadataRole;
        } else if (emailRole === 'admin') {
            finalRole = 'admin';
        } else if (emailRole === 'instructor') {
            finalRole = 'instructor';
        }

        return {
            id: sbUser.id,
            email: sbUser.email!,
            name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User',
            role: finalRole,
            avatar: sbUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${sbUser.email}`,
            permissions: sbUser.user_metadata?.permissions || []
        };
    };

    // Helper to sync preferences from DB (Theme & Currency)
    const syncUserPreferences = async (userId: string) => {
        try {
            const { data } = await supabase.from('profiles').select('preferences').eq('id', userId).single();
            if (data?.preferences) {
                if (data.preferences.theme) {
                    applyTheme(data.preferences.theme);
                }
                if (data.preferences.currency) {
                    setCurrency(data.preferences.currency);
                }
            }
        } catch (e) {
            console.error("Failed to sync preferences", e);
        }
    };

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            const stored = localStorage.getItem('aelgo_user');
            if (stored) setUser(JSON.parse(stored));
            setLoading(false);
            return;
        }

        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(mapSupabaseUser(session.user));
                    syncUserPreferences(session.user.id);
                }
            } catch (error) {
                console.error("Auth check failed", error);
            } finally {
                setLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(mapSupabaseUser(session.user));
                syncUserPreferences(session.user.id);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, role: UserRole) => {
        if (!isSupabaseConfigured()) {
            const mockUser = (role.includes('admin') || role === 'instructor') ? MOCK_USER_ADMIN : MOCK_USER_STUDENT;
            mockUser.role = role;
            if (role === 'instructor') {
                mockUser.name = "Dr. Angela Yu";
            }
            setUser(mockUser);
            localStorage.setItem('aelgo_user', JSON.stringify(mockUser));
            return;
        }
    };

    const logout = async () => {
        if (isSupabaseConfigured()) {
            await supabase.auth.signOut();
        } else {
            localStorage.removeItem('aelgo_user');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading: loading }}>
            {children}
        </AuthContext.Provider>
    );
};
