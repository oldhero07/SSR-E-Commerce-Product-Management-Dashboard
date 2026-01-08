"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
})

export default function ForgotPasswordForm() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setLoading(false)
        setSuccess(true)
        console.log("Reset link requested for:", values.email)
    }

    if (success) {
        return (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400">
                    <AlertTitle className="mb-2 text-lg font-medium">Link Sent!</AlertTitle>
                    <AlertDescription>
                        If an account exists for <strong>{form.getValues("email")}</strong>, we have sent a password reset link to it. Please check your inbox and spam folder.
                    </AlertDescription>
                </Alert>
                <div className="text-center">
                    <Button variant="link" asChild className="text-muted-foreground">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input placeholder="admin@example.com" {...field} disabled={loading} className="h-11" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Link...
                        </>
                    ) : (
                        "Send Reset Link"
                    )}
                </Button>

                <div className="text-center">
                    <Button variant="link" asChild className="text-sm text-muted-foreground">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                        </Link>
                    </Button>
                </div>
            </form>
        </Form>
    )
}
