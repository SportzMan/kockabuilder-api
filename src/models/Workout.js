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

    exercises: [{
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise"
        }, 
        reps: Number,
        rest: Number,
        name: String,
        thumbnailPath: String  
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

workoutSchema.methods.addWorkoutExercise = function addWorkoutExercise(exercise){
    this.exercises.push(exercise);
}

workoutSchema.methods.resetExercises = function resetExercises(){
    this.exercises = []
}

workoutSchema.plugin(uniqueValidator, { message: "Már létezik ilyen nevű edzés!" });

export default mongoose.model("Workout", workoutSchema);