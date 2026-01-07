import ProductForm from "@/components/forms/ProductForm";
import { Card, CardContent } from "@/components/ui/card";

export default function AddProductPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Add Product</h2>
            <Card>
                <CardContent className="pt-6">
                    <ProductForm />
                </CardContent>
            </Card>
        </div>
    );
}
