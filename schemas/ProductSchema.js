const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ["jeans", "jackets", "bags", "wallets"]
    },

    name: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        default: 0,
    },

    price: {
        type: Number,
        required: true,
    },

    sizes: {
        type: [String],
        required: true,
    },

    pictures: {
        type: [String],
        required: true
    }
},
{
    timestamps: true,
}
)

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product; //exporting it