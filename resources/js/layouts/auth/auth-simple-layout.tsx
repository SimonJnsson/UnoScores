import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-[color:var(--uno-black)]">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    {/* Login card with UNO-style design */}
                    <div className="bg-white rounded-3xl shadow-2xl border-4 border-white p-8 transform hover:scale-[1.02] transition-transform duration-200">
                        <div className="flex flex-col items-center gap-6">
                            <Link href={home()} className="flex flex-col items-center gap-3 font-medium">
                                <div className="mb-1 flex h-20 w-20 items-center justify-center">
                                    <AppLogoIcon className="size-20" />
                                </div>
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-3 text-center">
                                <h1 className="text-2xl font-black text-[color:var(--uno-black)] tracking-tight">{title}</h1>
                                <p className="text-center text-sm text-gray-600 font-medium">{description}</p>
                            </div>
                            
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
