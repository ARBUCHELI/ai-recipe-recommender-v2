interface RegisterData {
    name: string;
    email: string;
    password: string;
}
interface LoginData {
    email: string;
    password: string;
}
interface AuthResponse {
    success: boolean;
    user?: {
        id: string;
        name: string;
        email: string;
        avatarUrl: string | null;
        createdAt: Date;
    };
    token?: string;
    message?: string;
}
export declare class AuthService {
    private generateToken;
    register(data: RegisterData): Promise<AuthResponse>;
    login(data: LoginData): Promise<AuthResponse>;
    getCurrentUser(userId: string): Promise<AuthResponse>;
}
export {};
//# sourceMappingURL=authService.d.ts.map