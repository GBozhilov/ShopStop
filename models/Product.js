const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {type: Schema.Types.String, required: true},
    description: {type: Schema.Types.String, required: true},
    price: {
        type: Schema.Types.Number,
        min: 0,
        max: Number.MAX_VALUE,
        default: 0
    },
    image: {type: Schema.Types.String},
    creator: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    buyer: {type: Schema.Types.ObjectId, ref: 'User'},
    category: {type: Schema.Types.ObjectId, ref: 'Category', required: true}
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;