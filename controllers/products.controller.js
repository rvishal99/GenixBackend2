import AppError from "../Utilities/error.util.js";
import Products from "../models/products.model.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';

const getAllProducts = async (req, res, next) => {
    try {
        const Productss = await Products.find();
        res.status(201).json({
            success: true,
            message: 'All Products',
            "Products": Productss
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}
const getAllBids = async (req, res, next) => {
    try {
        const { id } = req.params;

        // console.log(id)
        const product = await Products.findById(id);

        if (!product) {
            return next(new AppError('Invalid Product Id', 400));
        }

        res.status(200).json({
            success: true,
            message: 'Bids fetched successfully',
            product: product
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}


const createProduct = async (req, res, next) => {

    const { name, description, startingBid, endDate, createdBy } = req.body;
    // console.log(image)
    if (!name || !description || !startingBid || !endDate || !createdBy) {
        return next(new AppError('All fields are required', 400));
    }


    let obj = {
        name,
        description,
        startingBid,
        endDate,
        image: {
            public_id: 'Dummy',
            secure_url: 'Dummy'
        },
        createdBy
    }

    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            });

            if (result) {
                obj.image.public_id = result.public_id;
                obj.image.secure_url = result.secure_url;

                fs.rm(`uploads/${req.file.filename}`);
            }
        } catch (error) {
            return next(new AppError(error.message, 500));
        }
    }


    try {
        let product = await Products.create(obj);

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product Created successfully',
            product: product
        });
    }
    catch (error) {
        return next(new AppError(error.message, 500));
    }
}

const removeProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await Products.findById(id);

        if (!product) {
            return next(new AppError('Product with given id doesnot exist', 500))
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Product Deleted Successfully'
        })
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, endDate,createdBy } = req.body;
        

        console.log(name,  description, endDate,createdBy)
        const product = await Products.findById(id);

        if (!product) {
            return next(new AppError('Product with given id does not exist', 500));
        }

        // Update product fields if they are provided in the request body
        if (name) product.name = name;
        if (description) product.description = description;
        if (endDate) product.endDate = endDate;
        if (createdBy) product.createdBy = createdBy;

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product Updated Successfully',
            product
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}

const addBidToProductById = async (req, res, next) => {
    const { bidderName, currentBid, maxBid } = req.body;

    console.log(req.body)
    const { id } = req.params;

    if (!bidderName || !currentBid) {
        return next(new AppError('All fields are required', 400))
    }
    const product = await Products.findById(id);

    if (!product) {
        return next(new AppError('Product with given id doesnot exist', 500))
    }
    let obj = {
        bidderName: bidderName,
        currentBid: currentBid
    }
    if (maxBid) {
        obj['maxBid'] = maxBid
    }
    product.bids.push(obj);


    product.numberOfBids = product.bids.length;
    await product.save();

    res.status(200).json({
        success: true,
        message: "Bid successfully added to the product",
        product
    })
}

export {
    getAllProducts, createProduct, removeProduct, addBidToProductById, getAllBids
}