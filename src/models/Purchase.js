import mongoose from "mongoose";

const purchaseSchema = mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    name: {
        type: String,
        required: true,
        index: true
    },

    duration: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    }
},
{ timestamps: true }
);

purchaseSchema.methods.setUser = function setUser(user){
    this.user = user;
}

purchaseSchema.methods.setDuration = function setDuration(duration){
    this.duration = duration;
}

purchaseSchema.methods.setPrice = function setPrice(price){
    this.price = price;
}

purchaseSchema.methods.setName = function setName(name){
    this.name = name;
}


export default mongoose.model("Purchase", purchaseSchema);