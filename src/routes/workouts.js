import express from "express";
import Workout from "../models/Workout.js";
import Exercise from "../models/Exercise.js";
import User from "../models/User.js";
import multer from "multer";
import parseErrors from "../utils/parseErrors.js";
import fs from "fs";
import path from "path";


const router = express.Router();

///////////////////////////////////
// Multer konfigurációja
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

// Feltöltési paraméterek (hely, kiterjesztések) állítása
const upload = multer({ storage: workoutStorage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    if(ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png"){
        return cb(new Error());
    }
    cb(null, true)
  }
 }).single("workout");
//
///////////////////////////////////

///////////////////////////////////
//  Borítókép feltöltése
router.post("/upload_file", (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ errors: {global: "A fájl feltöltése sikertelen volt! Csak jpg/jpeg/png kiterjesztésű fájlok elfogadottak"} });
        } else {
           return res.json({ thumbnailPath: res.req.file.path});
        }
    })
});
//
///////////////////////////////////

///////////////////////////////////
//  Borítókép eltávolítása
router.post("/delete_file", (req, res) => {
  const {thumbnailPath} = req.body.file;
  fs.unlink(thumbnailPath, err => {
    if(err) return res.status(400).json({errors: {global: "Hiba történt a fájl törlése közben!"}})
  })

  return res.json({thumbnailPath: ""})
})
//
///////////////////////////////////

///////////////////////////////////
// Új edzés létrehozása
router.post("/add_workout", (req, res) => {
  const { name, owner, workoutGroups, thumbnailPath, description} = req.body.workout;
  const workout = new Workout({ name });
  workout.setDesc(description);
  workout.setThumbnail(thumbnailPath);

// Workout groupok töltése, majd mentése a workout objektumba
  workoutGroups.forEach(item => {
    workout.addWorkoutGroup(item);
  })

// A User model alapján megkeressük a paraméterben megkapott felhasználót, majd beállítjuk a hivatkozást
// Segítség: https://stackoverflow.com/questions/38298927/get-id-with-mongoose
  User.findOne({ email: owner.email }).lean().exec((error, user) => {
    if(user){
      workout.setOwner( user._id );

      workout.save()
      .then(wRecord => 
        res.json({ workout: wRecord})
      )
      .catch((err) => {res.status(400).json({ errors: parseErrors(err.errors) });
      });
    }
 
    if(error){
      return res.status(400).json({erros: {global: "Nem sikerült létrehozni a bejegyzést mert a felhasználó nem létezik."}})
    }
  })
  
  // Létre kell hoznunk az edzéshez kapcsolódó workoutExercise objektummokat, majd a PUSH segítségével beküldjük
  /*workoutExercises.forEach(item => {

    Exercise.findOne({ name: item.Exercise.name }).lean().exec((error, ex) => {
      workout.addWorkoutExercise({exercise: ex._id, reps: item.reps, rest: item.rest})
      if(error){
        return res.status(400).json({errors: {global: "Nem sikerült létrehozni a bejegyzést mert nem létezik a gyakorlat."}})
      }
    })

  })*/

});
//
///////////////////////////////////

///////////////////////////////////
//  Edzés módosítása
router.post("/update_workout", (req, res) => {
  const {workout} = req.body;

  Workout.findOne({name: workout.originalName}).then((work) => {
    if(work){
      work.setName(workout.name)
      work.setDesc(workout.description)
      work.setThumbnail(workout.thumbnailPath)
      work.resetGroups();

      workout.workoutGroups.forEach(group => {
        work.addWorkoutGroup(group)
      })
  
      work.save()
        .then(wRecord => {
          res.json({workout: wRecord})
        })
        .catch((err) => res.status(400).json({ errors: parseErrors(err.errors) }));
    }
    else {
      res.status(400).json({
        errors: {
          global: "Hiba történt az edzés adatainak módosítása közben!",
        },
      });
    }

  })
});
//
///////////////////////////////////

///////////////////////////////////
//  Edzés törlése

router.post("/delete_workout", (req, res) => {
  const {workout} = req.body;

  Workout.findOneAndRemove({name: workout.name})
    .then(() => res.status(200).json({success: "Sikeres törlés!"}))
    .catch(() => res.status(400).json({ errors: {global: "Hiba történt az edzés törlése közben!"}}))
})
//
///////////////////////////////////

///////////////////////////////////
//  Összes edzés lekérése
// Meghívható paraméterül átadott felhasználóval és peraméter nélkül
// Paraméteres esetben a felhasználó által készített edzéssel adja vissza
// Paraméter nélkül az összes edzéssel tér vissza
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
//
///////////////////////////////////

///////////////////////////////////
//  Adott edzés lekérése
router.post("/get_workout", (req, res) => {
  const {workout} = req.body;
  Workout.findById(workout).then(workout => {
    if(workout) {res.json({workout})}
    else res.status(400).json({errors: { global: "Hiba történt az edzés lekérése közben!"}})
  })
})
//
///////////////////////////////////

export default router;
