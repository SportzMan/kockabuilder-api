import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";


const exerciseSchema = mongoose.Schema({

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

    filePath : {
        type: String,
    },

    thumbnailPath: {
        type: String
    }
},
{ timestamps: true }
);

exerciseSchema.methods.setName = function setName(name){
    this.name = name;
}

exerciseSchema.methods.setOwner = function setOwner(owner){
    this.owner = owner;
}

exerciseSchema.methods.setFilePath = function setFilePath(filePath){
    this.filePath = filePath;
}

exerciseSchema.methods.setThumbnail = function setThumbnail(thumbnailPath){
    this.thumbnailPath = thumbnailPath;
}

exerciseSchema.plugin(uniqueValidator, { message: "Már létezik ilyen nevű gyakorlat!" });

export default mongoose.model("Exercise", exerciseSchema);