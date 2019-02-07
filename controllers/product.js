const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');

module.exports.addGet = (req, res) => {
    Category
        .find()
        .then((categories) => {
            res.render('product/add', {categories})
        });
};

module.exports.addPost = async (req, res) => {
    let productObj = req.body;
    productObj.image = '\\' + req.file.path;
    productObj.creator = req.user._id;

    let product = await Product.create(productObj);
    let category = await Category.findById(product.category);
    category.products.push(product._id);
    category.save();

    res.redirect('/');
};

module.exports.editGet = (req, res) => {
    const id = req.params.id;

    Product
        .findById(id)
        .then(product => {
            if (!product) {
                res.sendStatus(404);
                return;
            }

            if (product.creator.equals(req.user._id)
                || req.user.roles.indexOf('Admin') >= 0) {
                Category
                    .find()
                    .then(categories => {
                        res.render('product/edit', {product, categories})
                    });
            } else {
                res.redirect(`/?error=${encodeURIComponent('Only Admins Or Creators Can Edit')}`);
            }
        })
};

module.exports.editPost = async (req, res) => {
    const id = req.params.id;
    const editedProduct = req.body;

    const product = await Product.findById(id);

    if (!product) {
        res.redirect(`/?error=${encodeURIComponent('Product Was Not Found!')}`);
        return;
    }

    product.name = editedProduct.name;
    product.description = editedProduct.description;
    product.price = editedProduct.price;

    if (req.file) {
        product.image = '\\' + req.file.path;
    }

    if (product.category.toString() !== editedProduct.category) {
        Category
            .findById(product.category)
            .then(currentCategory => {
                Category
                    .findById(editedProduct.category)
                    .then(newCategory => {
                        const index = currentCategory.products.indexOf(product._id);

                        if (index >= 0) {
                            currentCategory.products.splice(index, 1)
                        }

                        currentCategory.save();

                        newCategory.products.push(product._id);
                        newCategory.save();

                        product.category = editedProduct.category;

                        product
                            .save()
                            .then(() => {
                                res.redirect(`/?success=${encodeURIComponent('Product Was Edited Successfully')}`);
                            });
                    })
            })
    } else {
        product
            .save()
            .then(() => {
                res.redirect(`/?success=${encodeURIComponent('Product Was Edited Successfully')}`);
            });
    }
};

module.exports.deleteGet = (req, res) => {
    const id = req.params.id;

    Product
        .findById(id)
        .then(product => {
            if (!product) {
                res.sendStatus(404);
                return;
            }

            if (product.creator.equals(req.user._id)
                || req.user.roles.indexOf('Admin') >= 0) {

                res.render('product/delete', {product});
            }
        })
};

module.exports.deletePost = (req, res) => {
    const id = req.params.id;

    Product
        .findById(id)
        .then(product => {
            if (!product) {
                res.sendStatus(404);
                return;
            }

            Category
                .findById(product.category)
                .then(category => {
                    const index = category.products.indexOf(product._id);

                    if (index >= 0) {
                        category.products.splice(index, 1);
                        category.save();
                    }

                    Product
                        .remove({_id: id})
                        .then(() => {
                            fs.unlink(path.normalize(path.join('.', product.image)), () => {
                                res.redirect(`/?success=${encodeURIComponent('Product Was Deleted Successfully')}`);
                            })
                        });
                });
        })
};

module.exports.buyGet = (req, res) => {
    const id = req.params.id;

    Product
        .findById(id)
        .then(product => {
            if (!product) {
                res.sendStatus(404);
                return;
            }

            res.render('product/buy', {product});
        })
};

module.exports.buyPost = (req, res) => {
    const productId = req.params.id;

    Product
        .findById(productId)
        .then(product => {
            if (product.buyer) {
                const error = `error=${encodeURIComponent('Product Was Already Bought')}`;
                res.redirect(`/?${error}`);
                return;
            }

            product.buyer = req.user._id;
            product.save()
                .then(() => {
                    req.user.boughtProducts.push(productId);
                    req.user
                        .save()
                        .then(() => {
                            res.redirect('/');
                        })
                })
        })
        .catch(err => {
            console.log(err);
            res.redirect(`/?${err}`);
        });
};

module.exports.resetGet = (req, res) => {
    res.render('product/reset');
};

module.exports.resetPost = (req, res) => {
    Product.find()
        .then(products => {
            products.forEach(p => {
                p.buyer = null;
                p.save();
            });

            res.redirect('/');
        })
        .catch(e => console.log(e));
};