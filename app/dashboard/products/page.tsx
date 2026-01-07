"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { DeleteAction } from './delete-action';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
// Debounce hook
import { useDebounce } from 'use-debounce';

interface Product {
    _id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    images: string[];
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const page = parseInt(searchParams.get('page') || '1');
    const query = searchParams.get('query') || '';

    // Local state for input to allow typing without constant fetching
    const [searchTerm, setSearchTerm] = useState(query);
    const [debouncedSearch] = useDebounce(searchTerm, 500);

    useEffect(() => {
        // Sync URL when debounce completes
        const params = new URLSearchParams(searchParams);
        if (debouncedSearch) {
            params.set('query', debouncedSearch);
        } else {
            params.delete('query');
        }
        params.set('page', '1'); // Reset to page 1 on search
        router.replace(`${pathname}?${params.toString()}`);
    }, [debouncedSearch]); // Removed 'router', 'pathname', 'searchParams' to avoid loops, rely on debounce change

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/products?page=${page}&query=${query}&limit=5`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, query]); // Re-fetch when URL params change

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                <Link href="/dashboard/products/add">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell>
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="h-10 w-10 rounded-md object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-md bg-slate-200"></div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>${product.price}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            <Link href={`/dashboard/products/${product._id}`}>
                                                <Button variant="outline" size="sm">Edit</Button>
                                            </Link>
                                            <DeleteAction id={product._id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1 || loading}
                >
                    <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <div className="text-sm font-medium">
                    Page {page} of {totalPages || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages || loading}
                >
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
