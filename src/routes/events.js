import express from "express";
import User from "../models/User.js";
import Event from "../models/Event.js";
import parseErrors from "../utils/parseErrors.js";


const router = express.Router();

router.post("/add_event", (req, res) => {
  const {event} = req.body;

  User.findOne({ email: event.user.email}).lean().exec((error, user) => {
    const eventDB = new Event({title: event.title, user: user._id, color: event.color, from: event.from, to: event.to})

    eventDB.save()
    .then((eventRecord) => {
      res.json({ event: eventRecord})
    })
    .catch((err) => {res.status(400).json({ errors: parseErrors(err.errors) }) })

    if(error){
      return res.status(400).json({erros: {global: "Nem sikerült létrehozni a bejegyzést mert nem létezik a felhasználó."}})
    }
      
  })

})

router.post("/get_events", (req, res) => {
  const {user} = req.body;
  if(user){
    User.find({email: user.email}).then((user)=>{
      if(user){
        Event.find( {user: user} ).then((events) => {
            if(events){
              res.json({ events });
            } else{
              res.status(400)
              .json({ errors: { global: "Hiba történt az események lekérése közben!" } });
            }
            })
      }else res.status(400).json({ errors: { global: "Hiba történt az események lekérése közben!"}})
    })
  }
})

export default router;
