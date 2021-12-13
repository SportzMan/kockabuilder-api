import express from "express";
import Exercise from "../models/Exercise.js";
import User from "../models/User.js";
import multer from "multer";
import parseErrors from "../utils/parseErrors.js";
import ffmpeg from "fluent-ffmpeg";
import {unlink} from "fs";

const router = express.Router();

// A multer könytár segítségével tudjuk tárolni a kliens által küldött fájlokat a lemezen
// Multer GitHub + dokumentáció: https://github.com/expressjs/multer https://www.npmjs.com/package/multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/exercises/')
    },

    filename: (req, file, cb) => {
        cb(null, Date.now()+"_"+file.originalname )
    },

    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if(ext !== ".mp4"){
            return cb(res.status(400).end({errors: {global:"csak az mp4 formátum engedélyezett"}}), false);
        }
        cb(null, true)
    }
})

const upload = multer({ storage: storage }).single("video");

router.post("/upload_file", function(req, res) {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.json({ errors: {global: "A fájl feltöltése sikertelen volt!"} });
        } else {
           return res.json({ filePath: res.req.file.path, fileName: res.req.file.filename });
        }
    })
});

// Új gyakorlat létrehozása
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


router.post("/create_thumbnail", (req, res) => {
    const {filePath} = req.body.data;

    var thumbsFilePath = "";
    var fileDuration = "";

    ffmpeg.ffprobe(filePath, (err, metadata) =>{

        fileDuration = metadata.format.duration;

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
export default router;
