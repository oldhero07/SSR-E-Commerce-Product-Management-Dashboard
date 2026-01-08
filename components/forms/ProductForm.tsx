"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Loader2, X } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    price: z.coerce.number().min(0.1, "Price must be at least 0.1."),
    stock: z.coerce.number().min(0, "Stock cannot be negative."),
    category: z.string().min(2, "Category is required."),
    images: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductData {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    images: string[];
}

interface ProductFormProps {
    initialData?: ProductData | null;
}

export default function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>(initialData?.images || []);
    const [uploading, setUploading] = useState(false);

    const form = useForm<ProductFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            price: initialData?.price || 0,
            stock: initialData?.stock || 0,
            category: initialData?.category || "",
            images: initialData?.images || [],
        },
    });

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setLoading(true);
            const payload = { ...data, images };

            const url = initialData ? `/api/products/${initialData._id}` : `/api/products`;
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save product");

            router.push("/dashboard/products");
            router.refresh();
        } catch {
            alert("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                setImages((prev) => [...prev, data.url]);
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (url: string) => {
        setImages((prev) => prev.filter((img) => img !== url));
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Product name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <Input placeholder="Electronics" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="99.99" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stock</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="10" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Product description..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <FormLabel>Images</FormLabel>
                    <div className="flex flex-wrap gap-4 mb-4">
                        {images.map((url) => (
                            <div key={url} className="relative w-24 h-24 border rounded overflow-hidden group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="Product" className="object-cover w-full h-full" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(url)}
                                    className="absolute top-0 right-0 p-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <Input
                            type="file"
                            accept="image/*"
                            className="max-w-[300px]"
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                        {uploading && <Loader2 className="animate-spin h-4 w-4" />}
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="ml-auto">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Save Changes" : "Create Product"}
                </Button>
            </form>
        </Form>
    );
}
