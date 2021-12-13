import mongoose from "mongoose";

const purchaseSchema = mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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


export default mongoose.model("Program", purchaseSchema);