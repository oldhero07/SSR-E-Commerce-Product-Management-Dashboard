import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this product.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description for this product.'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price for this product.'],
    },
    stock: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        required: [true, 'Please specify a category.'],
    },
    images: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
