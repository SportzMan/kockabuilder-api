import express from "express";
import Exercise from "../models/Exercise.js";
import Workout from "../models/Workout.js";
import User from "../models/User.js";
import multer from "multer";
import parseErrors from "../utils/parseErrors.js";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

const router = express.Router();

///////////////////////////////////
// A multer könytár segítségével tudjuk tárolni a kliens által küldött fájlokat a lemezen
// Multer GitHub + dokumentáció: https://github.com/expressjs/multer https://www.npmjs.com/package/multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/exercises/')
    },

    filename: (req, file, cb) => {
        cb(null, Date.now()+"_"+file.originalname )
    },

})

const upload = multer({ storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    if(ext !== ".mp4"){
        console.log(ext)
        return cb(new Error());
    }
    cb(null, true)
  }
 }).single("video");

///////////////////////////////////
// Fájl feltöltése multer segítségével
router.post("/upload_file", function(req, res) {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ errors: {global: "A fájl feltöltése sikertelen volt! A fájlnak .mp4 formátumúnak kell lennie!"} });
        } else {
           return res.json({ filePath: res.req.file.path, fileName: res.req.file.filename });
        }
    })
});

///////////////////////////////////
//  Új gyakorlat létrehozása
router.post("/add_exercise", (req, res) => {
  const { name, owner, filePath, thumbnailPath } = req.body.exercise;
  const exercise = new Exercise({ name });
  exercise.setFilePath(filePath);
  exercise.setThumbnail(thumbnailPath);

    // A User model alapján megkeressük a paraméterben megkapott felhasználót, majd beálltjuk a hivatkozást
    // Segítség: https://stackoverflow.com/questions/38298927/get-id-with-mongoose
  User.findOne({ email: owner.email }).lean().exec((error, user) => {
    exercise.setOwner(user._id )
    if(error){
        return res.status(400).json({erros: {global: "Nem sikerült létrehozni a bejegyzést mert nem létezik a felhasználó."}})
    }
  })
  
  exercise.save()
    .then((exRecord) => {
      res.json({ exercise: exRecord});
    })
    .catch((err) => res.status(400).json({ errors: parseErrors(err.errors) }));
});

///////////////////////////////////
//  Gyakorlat módosítása
router.post("/update_exercise", (req, res) => {
  console.log(req.body)
  const {exercise} = req.body;

  Exercise.findOne({name: exercise.originalName}).then((ex) => {
    if(ex){
      ex.setName(exercise.name)
      ex.setFilePath(exercise.filePath)
      ex.setThumbnail(exercise.thumbnailPath)
  
      ex.save()
        .then(exRecord => {
          res.json({exercise: exRecord})
        })
        .catch((err) => res.status(400).json({ errors: parseErrors(err.errors) }));
    }
    else {
      res.status(400).json({
        errors: {
          global: "Hiba történt a gyakorlat adatainak módosítása közben!",
        },
      });
    }

  })
});

///////////////////////////////////
//  Gyakorlat törlése
router.post("/delete_exercise", (req, res) => {
  const {exercise} = req.body;

  Exercise.findOneAndRemove({name: exercise.name})
    .then(() => res.status(200).json({success: "Sikeres törlés!"}))
    .catch(() => res.status(400).json({ errors: {global: "Hiba történt a gyakorlat törlése közben!"}}))
})

///////////////////////////////////
//  Borítókép készítése ffmpeg segtségével
router.post("/create_thumbnail", (req, res) => {
    const {filePath} = req.body.data;

    var thumbsFilePath = "";

    ffmpeg.ffprobe(filePath, (err, metadata) =>{
        if(err){
            return res.status(400).json({ errors: {global: "Nem sikerült létrehozni az előnézeti képet!"}})
        }
    })
    
    ffmpeg(filePath)
        .on("filenames", (filenames) => {
            thumbsFilePath = "uploads/exercises/thumbnails/" + filenames[0];

        })
        .on("end", () => {
            return res.json({thumbnailPath: thumbsFilePath})
        })
        .screenshots({
            count: 1,
            folder: "uploads/exercises/thumbnails",
            size: "320x240",
            filename: "thumbnail-%b.png"
        });
});

///////////////////////////////////
//  Borítókép és a hozzá tartozó videó eltávolítása
router.post("/delete_files", (req, res) => {
  const {filePath, thumbnailPath} = req.body.data;
  fs.unlink(filePath, err => {
    if(err) return res.status(400).json({errors: {global: "Hiba történt a fájl törlése közben!"}})
  })

  fs.unlink(thumbnailPath, err => {
    if(err) return res.status(400).json({errors: {global: "Hiba történt a fájl törlése közben!"}})
  })

  return res.json({filePath: "", thumbnailPath: ""})
})

///////////////////////////////////
//  Összes gyakorlat lekérése
//// Meghívható paraméterül átadott felhasználóval és peraméter nélkül
//// Paraméteres esetben a felhasználó által készített gyakorlatokat adja vissza
//// Paraméter nélkül az összes gyakorlattal tér vissza
router.post("/get_exercises", (req, res) => {
  if(req.body.user){
    User.find({email: req.body.user.email}).then((user)=>{
      if(user){
        Exercise.find( {owner: user} ).then((exercises) => {
            if(exercises){
              res.json({ exercises });
            } else{
              res.status(400)
              .json({ errors: { global: "Hiba történt a gyakorlatok lekérése közben!" } });
            }
            })
      }else res.status(400).json({ errors: { global: "Hiba történt a gyakorlatok lekérése közben!"}})
    })

    }else{
      Exercise.find( {} ).then((exercises) => {
        if(exercises){
          res.json({ exercises });
        } else{
          res.status(400)
          .json({ errors: { global: "Hiba történt a gyakorlatok lekérése közben!" } });
        }
        })
    }
});

///////////////////////////////////
//  Konkrét gyakorlat lekérése
router.post("/get_exercise", (req, res) => {
  const {exercise} = req.body;
  Exercise.findById(exercise).then(ex => {
    if(ex) res.json({exercise: ex, reps: exercise.reps, rest: exercise.rest})
    else res.status(400).json({errors: { global: "Hiba történt a gyakorlat lekérése közben!"}})
  })
})

export default router;
