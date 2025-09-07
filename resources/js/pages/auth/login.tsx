import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <Form {...AuthenticatedSessionController.store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6 w-full">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-3">
                                <Label htmlFor="email" className="text-[color:var(--uno-black)] font-bold text-sm">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className="border-2 border-gray-200 rounded-xl px-4 py-3 text-[color:var(--uno-black)] placeholder:text-gray-400 focus:border-[color:var(--uno-blue)] focus:ring-[color:var(--uno-blue)] transition-colors"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-[color:var(--uno-black)] font-bold text-sm">Password</Label>
                                    {canResetPassword && (
                                        <TextLink href={request()} className="ml-auto text-sm text-[color:var(--uno-blue)] hover:text-[color:var(--uno-red)] font-medium transition-colors" tabIndex={5}>
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="border-2 border-gray-200 rounded-xl px-4 py-3 text-[color:var(--uno-black)] placeholder:text-gray-400 focus:border-[color:var(--uno-blue)] focus:ring-[color:var(--uno-blue)] transition-colors"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" tabIndex={3} className="data-[state=checked]:bg-[color:var(--uno-green)] data-[state=checked]:border-[color:var(--uno-green)]" />
                                <Label htmlFor="remember" className="text-[color:var(--uno-black)] font-medium text-sm">Remember me</Label>
                            </div>

                            <Button 
                                type="submit" 
                                className="mt-2 w-full bg-gradient-to-r from-[color:var(--uno-red)] to-[color:var(--uno-yellow)] hover:from-[color:var(--uno-blue)] hover:to-[color:var(--uno-green)] text-white font-black text-lg py-4 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-200" 
                                tabIndex={4} 
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-5 w-5 animate-spin mr-2" />}
                                {processing ? 'Logging in...' : 'Log in'}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-gray-600 font-medium">
                            Don't have an account?{' '}
                            <TextLink href={register()} tabIndex={5} className="text-[color:var(--uno-blue)] hover:text-[color:var(--uno-red)] font-bold transition-colors">
                                Sign up
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
