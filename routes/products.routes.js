import { Router } from 'express';
import { addBidToProductById, createProduct, getAllProducts, removeProduct, getAllBids, updateProduct } from '../controllers/products.controller.js';

import { authorizeRoles, authorizedSubscriber, isLoggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/')
    .get(getAllProducts)
    .post(upload.single('image'),
        createProduct
    );

router.route('/:id')
    .get(getAllBids)

    .put(addBidToProductById)

    .delete(removeProduct)
    ;

router.route('/update/:id')
    .put(updateProduct)

    
export default router;