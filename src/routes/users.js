import express from "express";
import User from "../models/User.js";
import parseErrors from "../utils/parseErrors.js";
import { sendConfirmationEmail } from "../mailer.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { username, email, password } = req.body.user;
  const user = new User({ email });
  user.setUsername(username);
  user.setPassword(password);
  user.setConfirmationToken();
  user
    .save()
    .then((userRecord) => {
      sendConfirmationEmail(userRecord);
      res.json({ user: userRecord.toAuthJSON() });
    })
    .catch((err) => res.status(400).json({ errors: parseErrors(err.errors) }));
});

// Felhasználói profil módosítása
router.post("/update_profile", (req, res) => {
  const { data } = req.body;
  User.findOne({ email: data.email }).then((user) => {
    if (user) {
      user.setUsername(data.username);
      user.save().then(res.json({ user: user.toAuthJSON() }));
    } else {
      res
        .status(400)
        .json({
          errors: { global: "Hiba történt az adatok módosítása közben!" },
        });
    }
  });
});

////////////////////
// Összes felhasználó legyűjtése
router.get("/get_users", (req, res) => {
  User.find(
    {},
    { email: 1, username: 1, isAdmin: 1, isTrainer: 1, membership: 1 }
  ).then((users) => {
    if(users){
      res.json({ users });
    } else{
      res
      .status(400)
      .json({ errors: { global: "Hiba történt a felhasználók lekérése közben!" } });
    }
    });
});
// Visszatérő értékben megkapjuk az adatbázisban található összes felhasználót.
// A vetítés úgy kerül defíniálásra, hogy csak az _id, email, username, isAdmin, isTrainer attribútumokat tartalmazza egy user objektum.

router.post("/get_user_info", (req, res) => {
  const { data } = req.body;
  User.findOne(
    { email: data.email },
    { email: 1, username: 1, isAdmin: 1, isTrainer: 1, membership: 1 }
  ).then((user) => {
    if (user) {
      res.json({ user: user });
    } else {
      res
        .status(400)
        .json({ errors: { global: "A keresett felhasználó nem található!" } });
    }
  });
});

router.post("/edit_user", (req, res) => {
  const { data } = req.body;
  User.findOne({ email: data.email }).then((user) => {
    if (user) {
      user.setMembership(data.membership);
      user.setAdminRight(data.isAdmin);
      user.setTrainerRight(data.isTrainer);
      user.save().then(res.json({ user: user }));
    } else {
      res.status(400).json({
          errors: {
            global: "Hiba történt a felhasználó adatainak módosítása közben!",
          },
        });
    }
  });
});

router.post("/membership", (req, res) => {
  const { data } = req.body;

  User.findOne({ email: data.user.email}).then((user) => {
    const today = new Date()
    if(user){
      if(user.membership < today){
        today.setDate(today.getDate() + data.duration)
        user.setMembership(today)
        user.save().then(res.json({ user: user }));
      }
      else {
        const date = new Date(user.membership)
        date.setDate( date.getDate()+data.duration)
        user.setMembership(date)
        user.save().then(res.json({ user: user }));
      }
    }else {
      res.status(400).json({
        errors: {
          global: "Hiba történt a felhasználó adatainak módosítása közben!",
        },
      });}
  })
})

///////////////////////////////////
//  Gyakorlat törlése
router.post("/delete_user", (req, res) => {
  const {user} = req.body;
  User.findOneAndRemove({username: user.username})
    .then(() => res.status(200).json({success: "Sikeres törlés!"}))
    .catch(() => res.status(400).json({ errors: {global: "Hiba történt a gyakorlat törlése közben!"}}))
})

export default router;
