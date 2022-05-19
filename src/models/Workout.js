import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";


const workoutSchema = mongoose.Schema({

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

    workoutGroups: [{
        workoutExercises: [{
            exercise: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Exercise"
            }, 
            reps: {type: Number, required: true},
            rest: {type: Number, required: true},
            type: {type: Boolean, required: true},
            name: {type: String, required: true},
            thumbnailPath: {type: String, required: true}  
        }],
        rounds : {
            type: Number,
            required: true
        }
    }],

    thumbnailPath: {
        type: String
    }
},
{ timestamps: true }
);

workoutSchema.methods.setOwner = function setOwner(owner){
    this.owner = owner;
}

workoutSchema.methods.setName = function setName(name){
    this.name = name;
}

workoutSchema.methods.setDesc = function setDesc(description){
    this.description = description;
}

workoutSchema.methods.setThumbnail = function setThumbnail(thumbnailPath){
    this.thumbnailPath = thumbnailPath;
}

workoutSchema.methods.addWorkoutGroup = function addWorkoutGroup(group){
    this.workoutGroups.push(group);
}

workoutSchema.methods.resetGroups = function resetGroups(){
    this.workoutGroups = []
}

workoutSchema.plugin(uniqueValidator, { message: "Már létezik ilyen nevű edzés!" });

export default mongoose.model("Workout", workoutSchema);