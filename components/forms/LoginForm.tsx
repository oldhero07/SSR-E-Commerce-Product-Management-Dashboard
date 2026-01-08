"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid credentials. Please check your email and password.");
                setLoading(false);
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            setLoading(false);
        }
    };

    return (
        <Card className="w-[400px] shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center font-serif">NexusAdmin</CardTitle>
                <p className="text-center text-sm text-muted-foreground">Sign in to manage your inventory</p>
                <div className="mt-2 text-center text-xs bg-muted p-2 rounded-md border border-border">
                    <p className="font-semibold text-foreground">Demo Credentials:</p>
                    <p>Email: <code className="text-primary font-bold">admin@example.com</code></p>
                    <p>Password: <code className="text-primary font-bold">admin123</code></p>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <a href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</a>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-xs text-muted-foreground">Protected by NextAuth.js</p>
            </CardFooter>
        </Card>
    );
}
