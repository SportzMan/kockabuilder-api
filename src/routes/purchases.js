import express from "express";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import parseErrors from "../utils/parseErrors.js";


const router = express.Router();

router.post("/add_purchase", (req, res) => {
  const {user, membership} = req.body.purchase;

  User.findOne({ email: user.email}).lean().exec((error, user) => {
    const purchase = new Purchase({name: membership.description, user: user._id, duration: membership.duration, price: membership.duration})

    purchase.save()
    .then((purchaseRecord) => {
      res.json({ purchase: purchaseRecord})
    })
    .catch((err) => {res.status(400).json({ errors: parseErrors(err.errors) }) })

    if(error){
      return res.status(400).json({erros: {global: "Nem sikerült létrehozni a bejegyzést mert nem létezik a felhasználó."}})
    }
      
  })

})

router.post("/get_purchases", (req, res) => {
  if(req.body.user){
    User.find({email: req.body.user.email}).then((user)=>{
      if(user){
        Purchase.find( {owner: user} ).then((purchases) => {
            if(purchases){
              res.json({ purchases });
            } else{
              res.status(400)
              .json({ errors: { global: "Hiba történt a fizetések lekérése közben!" } });
            }
            })
      }else res.status(400).json({ errors: { global: "Hiba történt a fizetések lekérése közben!"}})
    })

    }else{
      Purchase.find( {} ).then((purchases) => {
        if(purchases){
          res.json({ purchases });
        } else{
          res.status(400)
          .json({ errors: { global: "Hiba történt a fizetések lekérése közben!" } });
        }
        })
    }
})
export default router;
