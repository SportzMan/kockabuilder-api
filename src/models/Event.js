import mongoose from "mongoose";

const eventSchema = mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    color: {
        type: String,
        required: true
    },

    from: {
        type: String,
        required: true
    },

    to: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        index: true
    }
},
{ timestamps: true }
);

eventSchema.methods.setUser = function setUser(user){
    this.user = user;
}

eventSchema.methods.setColor = function setColor(color){
    this.color = color;
}

eventSchema.methods.setFrom = function setFrom(from){
    this.from = from;
}

eventSchema.methods.setTo = function setTo(to){
    this.to = to;
}

eventSchema.methods.setTitle = function setTitle(title){
    this.title = title;
}


export default mongoose.model("Event", eventSchema);