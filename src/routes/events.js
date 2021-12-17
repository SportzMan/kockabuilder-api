import express from "express";
import User from "../models/User.js";
import Event from "../models/Event.js";
import parseErrors from "../utils/parseErrors.js";


const router = express.Router();

router.post("/add_event", (req, res) => {
  const {event_req, user} = req.body.event;

  User.findOne({ email: user.email}).lean().exec((error, user) => {
    const event = new Event({title: event_req.title, user: user._id, color: event_req.color, from: event_req.from, to: event_req.to})

    event.save()
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
