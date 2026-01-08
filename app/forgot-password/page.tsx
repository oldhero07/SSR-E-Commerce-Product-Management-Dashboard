import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import Link from "next/link";

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                        Forgot Password?
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email and we&apos;ll send you a link to reset your password.
                    </p>
                </div>

                <ForgotPasswordForm />
            </div>
        </div>
    );
}
