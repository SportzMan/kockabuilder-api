import express from "express";
import Workout from "../models/Workout.js";
import Program from "../models/Program.js";
import User from "../models/User.js";
import multer from "multer";
import parseErrors from "../utils/parseErrors.js";
import fs from "fs";


const router = express.Router();

// A multer könytár segítségével tudjuk tárolni a kliens által küldött fájlokat a lemezen
// Multer GitHub + dokumentáció: https://github.com/expressjs/multer https://www.npmjs.com/package/multer
const workoutStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/programs/')
    },

    filename: (req, file, cb) => {
        cb(null, Date.now()+"_"+file.originalname )
    },

})

const upload = multer({ storage: workoutStorage }).single("program");

// Borítókép feltöltése
router.post("/upload_file", function(req, res) {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.json({ errors: {global: "A fájl feltöltése sikertelen volt!"} });
        } else {
           return res.json({ thumbnailPath: res.req.file.path});
        }
    })
});

// Borítókép eltávolítása
router.post("/delete_file", (req, res) => {
  const filePath = req.body.file;
  fs.unlink(filePath, err => {
    if(err) return res.status(400).json({errors: {global: "Hiba történt a fájl törlése közben!"}})
  })

  return res.json({thumbnailPath: ""})
})

// Új edzés létrehozása
router.post("/add_program", (req, res) => {
  const { name, owner, workouts, thumbnailPath, description } = req.body.program;
  const program = new Program({ name });
  program.setDesc(description);
  program.setThumbnail(thumbnailPath);

// A User model alapján megkeressük a paraméterben megkapott felhasználót, majd beálltjuk a hivatkozást
// Segítség: https://stackoverflow.com/questions/38298927/get-id-with-mongoose
  User.findOne({ email: owner.email }).lean().exec((error, user) => {
    program.setOwner(user._id )
    if(error){
        return res.status(400).json({erros: {global: "Nem sikerült létrehozni a bejegyzést mert nem létezik a felhasználó."}})
    }
  })

  // Létre kell hoznunk az edzéshez kapcsolódó workoutExercise objektummokat, majd a PUSH segítségével beküldjük
  workouts.forEach(item => {
    Workout.findOne({ name: item.name }).lean().exec((error, workout) => {
      program.addWorkout(workout)
      if(error){
        return res.status(400).json({errors: {global: "Nem sikerült létrehozni a bejegyzést mert nem létezik az edzés!"}})
      }
    })

  })

  program.save()
    .then((programRecord) => {
      res.json({ program: programRecord})
    })
    .catch((err) => {res.status(400).json({ errors: parseErrors(err.errors) }) })
})

router.post("/get_programs", (req, res) => {
  if(req.body.user){
    User.find({email: req.body.user.email}).then((user)=>{
      if(user){
        Program.find( {owner: user} ).then((programs) => {
            if(programs){
              res.json({ programs });
            } else{
              res.status(400)
              .json({ errors: { global: "Hiba történt az edzésprogramok lekérése közben!" } });
            }
            })
      }else res.status(400).json({ errors: { global: "Hiba történt az edzésprogramok lekérése közben!"}})
    })

    }else{
      Program.find( {} ).then((programs) => {
        if(programs){
          res.json({ programs });
        } else{
          res.status(400)
          .json({ errors: { global: "Hiba történt az edzésprogramok lekérése közben!" } });
        }
        })
    }
})

export default router;
