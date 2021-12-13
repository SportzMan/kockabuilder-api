import express from "express";
import Workout from "../models/Workout.js";
import Exercise from "../models/Exercise.js";
import User from "../models/User.js";
import multer from "multer";
import parseErrors from "../utils/parseErrors.js";
import fs from "fs";


const router = express.Router();

// A multer könytár segítségével tudjuk tárolni a kliens által küldött fájlokat a lemezen
// Multer GitHub + dokumentáció: https://github.com/expressjs/multer https://www.npmjs.com/package/multer
const workoutStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/workouts/')
    },

    filename: (req, file, cb) => {
        cb(null, Date.now()+"_"+file.originalname )
    },

})

const upload = multer({ storage: workoutStorage }).single("workout");
// Borítókép feltöltése
router.post("/upload_file", (req, res) => {
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
router.post("/add_workout", (req, res) => {
  const { name, owner, workoutExercises, thumbnailPath, description } = req.body.workout;
  const workout = new Workout({ name });
  workout.setDesc(description);
  workout.setThumbnail(thumbnailPath);

// A User model alapján megkeressük a paraméterben megkapott felhasználót, majd beálltjuk a hivatkozást
// Segítség: https://stackoverflow.com/questions/38298927/get-id-with-mongoose
  User.findOne({ email: owner.email }).lean().exec((error, user) => {
    workout.setOwner(user._id )
    if(error){
        console.log("User.findOne")
        return res.status(400).json({erros: {global: "Nem sikerült létrehozni a bejegyzést mert nem létezik a felhasználó."}})
    }
  })

  // Létre kell hoznunk az edzéshez kapcsolódó workoutExercise objektummokat, majd a PUSH segítségével beküldjük
  workoutExercises.forEach(item => {

    Exercise.findOne({ name: item.Exercise.name }).lean().exec((error, ex) => {
      workout.addWorkoutExercise({exercise: ex._id, reps: item.reps, rest: item.rest})
      if(error){
        console.log("Exercise.findOne")
        return res.status(400).json({errors: {global: "Nem sikerült létrehozni a bejegyzést mert nem létezik a gyakorlat."}})
      }
    })

  })

  workout.save()
    .then((wRecord) => {
      console.log("volt mentés")
      res.json({ workout: wRecord});
    })
    .catch((err) => {res.status(400).json({ errors: parseErrors(err.errors) });
    console.log(parseErrors(err.errors))});
});

router.post("/get_workouts", (req, res) => {
  if(req.body.user){
    User.find({email: req.body.user.email}).then((user)=>{
      if(user){
        Workout.find( {owner: user} ).then((workouts) => {
            if(workouts){
              res.json({ workouts });
            } else{
              res.status(400)
              .json({ errors: { global: "Hiba történt az edzések lekérése közben!" } });
            }
            })
      }else res.status(400).json({ errors: { global: "Hiba történt az edzések lekérése közben!"}})
    })

    }else{
      Workout.find( {} ).then((workouts) => {
        if(workouts){
          res.json({ workouts });
        } else{
          res.status(400)
          .json({ errors: { global: "Hiba történt az edzések lekérése közben!" } });
        }
        })
    }
});

export default router;
