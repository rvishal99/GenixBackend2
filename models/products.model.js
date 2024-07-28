import { model, Schema } from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        minLength: [3, 'Title must be at least 8 characters'],
        maxLength: [59, 'Title must be less than 60 characters'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
    },
    startingBid: {
        type: Number,
        required: [true, 'Starting bid is required'],
    },
    endDate: {
        type: Date,
    },
    image: {
        public_id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    bids: [
        {
            bidderName: {
                type: String
            },
            currentBid: {
                type: Number
            },
            maxBid: {
                type: Number
            },
        }
    ],
    numberOfBids: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: String,
        required: [true, 'Product Owner Name is required']
    }
}, { timestamps: true });

const Products = model('Products', productSchema);

export default Products;
