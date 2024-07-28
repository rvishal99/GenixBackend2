import app from './app.js'
import connectionToDB from './config/dbConnection.js';
import cloudinary from "cloudinary";
import { version } from 'mongoose';
import swaggerjsdoc from "swagger-jsdoc"
import swaggerui from 'swagger-ui-express'

const PORT = process.env.PORT || 5000;



cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Genix Auction API Doc",
            version: "0.1.0"
        },
        servers: [{
            url: 'http://localhost:5014/'
        }],
        paths: {
            '/register': {
                post: {
                    summary: 'Register a new user',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        file: {
                                            type: 'string',
                                            format: 'binary'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'User registered successfully'
                        },
                        '400': {
                            description: 'Bad request'
                        }
                    }
                }
            },
            '/login': {
                post: {
                    summary: 'Login a user',
                    responses: {
                        '200': {
                            description: 'User logged in successfully'
                        },
                        '401': {
                            description: 'Unauthorized'
                        }
                    }
                }
            },
            '/logout': {
                post: {
                    summary: 'Logout a user',
                    responses: {
                        '200': {
                            description: 'User logged out successfully'
                        }
                    }
                }
            },
            '/me/{id}': {
                get: {
                    summary: 'Get user profile',
                    parameters: [{
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    }],
                    responses: {
                        '200': {
                            description: 'User profile retrieved successfully'
                        },
                        '401': {
                            description: 'Unauthorized'
                        }
                    }
                }
            },
            '/reset': {
                post: {
                    summary: 'Send password reset email',
                    responses: {
                        '200': {
                            description: 'Password reset email sent successfully'
                        },
                        '400': {
                            description: 'Bad request'
                        }
                    }
                }
            },
            '/reset/{resetToken}': {
                put: {
                    summary: 'Reset password',
                    parameters: [{
                        name: 'resetToken',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    }],
                    responses: {
                        '200': {
                            description: 'Password reset successfully'
                        },
                        '400': {
                            description: 'Bad request'
                        }
                    }
                }
            },
            
            '/products': {
                get: {
                    summary: 'Get all products',
                    responses: {
                        '200': {
                            description: 'List of products'
                        }
                    }
                },
                post: {
                    summary: 'Create a new product',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        image: {
                                            type: 'string',
                                            format: 'binary'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Product created successfully'
                        },
                        '400': {
                            description: 'Bad request'
                        }
                    }
                }
            },
            '/products/{id}': {
                get: {
                    summary: 'Get all bids for a product',
                    parameters: [{
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    }],
                    responses: {
                        '200': {
                            description: 'List of bids for the product'
                        },
                        '401': {
                            description: 'Unauthorized'
                        }
                    }
                },
                put: {
                    summary: 'Add a bid to a product by ID',
                    parameters: [{
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    }],
                    responses: {
                        '200': {
                            description: 'Bid added to product successfully'
                        },
                        '401': {
                            description: 'Unauthorized'
                        }
                    }
                },
                delete: {
                    summary: 'Remove a product by ID',
                    parameters: [{
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    }],
                    responses: {
                        '200': {
                            description: 'Product removed successfully'
                        },
                        '401': {
                            description: 'Unauthorized'
                        }
                    }
                }
            },
            '/products/update/{id}': {
                put: {
                    summary: 'Update a product by ID',
                    parameters: [{
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    }],
                    responses: {
                        '200': {
                            description: 'Product updated successfully'
                        },
                        '400': {
                            description: 'Bad request'
                        }
                    }
                }
            }
        }
    },
    apis: ['./routes/*.js']
};

export default options;


const spacs = swaggerjsdoc(options)
app.use(
    "/api-docs",
    swaggerui.serve,
    swaggerui.setup(spacs)
)

app.all('*', (req, res) => { // random url
    res.status(404).send('OOPS!! 404 page not found')
})
app.listen(PORT, async () => {
    await connectionToDB();
    console.log(`App is running at http://localhost:${PORT}`)
})