import ProductForm from "@/components/forms/ProductForm";
import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
    params: Promise<{ id: string }>
}

export default async function EditProductPage(props: Props) {
    const params = await props.params;
    const { id } = params;

    await dbConnect();

    const product = await Product.findById(id).lean();

    if (!product) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
            <Card>
                <CardContent className="pt-6">
                    <ProductForm initialData={JSON.parse(JSON.stringify(product))} />
                </CardContent>
            </Card>
        </div>
    );
}
