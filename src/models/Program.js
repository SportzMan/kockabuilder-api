import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";


const programSchema = mongoose.Schema({

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    name: {
        type: String,
        index: true,
        unique: true,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    workouts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout"
    }],

    thumbnailPath: {
        type: String
    }
},
{ timestamps: true }
);

programSchema.methods.setOwner = function setOwner(owner){
    this.owner = owner;
}

programSchema.methods.setName = function setName(name){
    this.name = name;
}

programSchema.methods.setDesc = function setDesc(description){
    this.description = description;
}

programSchema.methods.setThumbnail = function setThumbnail(thumbnailPath){
    this.thumbnailPath = thumbnailPath;
}

programSchema.methods.addWorkout = function addWorkout(workout){
    this.workouts.push(workout);
}

programSchema.plugin(uniqueValidator, { message: "Már létezik ilyen nevű edzésprogram!" });

export default mongoose.model("Program", programSchema);