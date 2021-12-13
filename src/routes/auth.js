import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendResetPasswordEmail } from "../mailer.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { credentials } = req.body;
  User.findOne({ email: credentials.email }).then((user) => {
    if (user && user.isValidPassword(credentials.password)) {
      res.json({ user: user.toAuthJSON() });
    } else {
      res
        .status(400)
        .json({ errors: { global: "Hibás hitelesítési adatok!" } });
    }
  });
});

router.post("/confirmation", (req, res) => {
  const token = req.body.token;
  User.findOneAndUpdate(
    { confirmationToken: token },
    { confirmationToken: "", confirmed: true },
    { new: true }
  ).then((user) =>
    user ? res.json({ user: user.toAuthJSON() }) : res.status(400).json({})
  );
});

router.post("/reset_password_request", (req, res) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      sendResetPasswordEmail(user);
      res.json({});
    } else {
      res
        .status(400)
        .json({ errors: { global: "Nincs ilyen email az adatbázisban!" } });
    }
  });
});

router.post("/validate_token", (req, res) => {
  jwt.verify(req.body.token, process.env.JWT_SECRET, (error) => {
    if (error) {
      res.status(401).json({});
    } else {
      res.json({});
    }
  });
});

router.post("/reset_password", (req, res) => {
  const { password, token } = req.body.data;
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      res.status(401).json({ errors: { global: "Érvénytelen token!" } });
    } else {
      User.findOne({ _id: decoded._id }).then((user) => {
        if (user) {
          user.setPassword(password);
          user.save().then(() => res.json({}));
        } else {
          res.status(404).json({ errors: { global: "Hiba történt az új jelszó beállítása közben!" } });
        }
      });
    }
  });
});

router.post("/change_password", (req, res) => {
    const { password, token } = req.body.data;
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        res.status(401).json({ errors: { global: "Érvénytelen token!" } });
      } else {
        User.findOne({ email: decoded.email}).then((user) => {
          if (user) {
            user.setPassword(password);
            user.save().then(() => res.json({}));
          } else {
            res.status(404).json({ errors: { global: "Hiba történt az új jelszó beállítása közben!" } });
          }
        });
      }
    });
  });
export default router;
