import express from "express";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import parseErrors from "../utils/parseErrors.js";


const router = express.Router();

router.post("/add_purchase", (req, res) => {
  let purchase = new Purchase();
  User.findOne( { email: req.body.user.email} ).lean().exec((error, user) => {
    if(error){
      return res.status(400).json({erros: {global: "Nem sikerült létrehozni a bejegyzést mert nem létezik a felhasználó."}})
    }else {
      purchase.setUser(user._id)
    }
  })

  purchase.setDuration(req.body.duration);
  purchase.setPrice(req.body.price);

  purchase.save()
    .then(res => res.status(200).json({purchase}))
    .catch(err => res.status(400).json({errors: parseErrors(err.errors)}))
})

router.post("/get_purchases", (res, req) => {
  if(req.body.user){
    User.find({email: req.body.user.email}).then((user)=>{
      if(user){
        Purchase.find( {owner: user} ).then((purchases) => {
            if(purchases){
              res.json({ purchases });
            } else{
              res.status(400)
              .json({ errors: { global: "Hiba történt az edzésprogramok lekérése közben!" } });
            }
            })
      }else res.status(400).json({ errors: { global: "Hiba történt az edzésprogramok lekérése közben!"}})
    })

    }else{
      Purchase.find( {} ).then((purchases) => {
        if(purchases){
          res.json({ purchases });
        } else{
          res.status(400)
          .json({ errors: { global: "Hiba történt az edzésprogramok lekérése közben!" } });
        }
        })
    }
})
export default router;
