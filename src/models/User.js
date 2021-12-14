import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import uniqueValidator from "mongoose-unique-validator";

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      unique: true
    },
    username: {type: String, required: true},
    passwordHash: { type: String, required: true },
    confirmed: { type: Boolean, default: false },
    confirmationToken: { type: String, default: "" },
    isAdmin: {type: Boolean, default: false},
    isTrainer: {type: Boolean, default: false},
    membership: {type: Date, default: "0000-01-01T00:00:00.000+00:00"}
  },
  { timestamps: true }
);
////////////////////////
// Jelszóellenőrzés
schema.methods.isValidPassword = function isValidPassword(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};
// Összehasonlítja a paraméterben kapott jelszó eltitkosított értékét az adatbázisban tárolt értékkel

////////////////////////
// Jelszó beállítása
schema.methods.setPassword = function setPassword(password) {
  this.passwordHash = bcrypt.hashSync(password, 10);
};
// Eltitkosítja a paraméterben megkapott jelszót, majd ezt eltárolja az adatbázisban

////////////////////////
// Felhasználónév beállítása
schema.methods.setUsername = function setUsername(username){
  this.username = username;
}
// Eltárolja a praméterként megkapott felhasználónevet az adatbázisba

////////////////////////
// Tagság határidejének beállítása
schema.methods.setMembership = function setMembership(date){
  this.membership = date;
}
// Eltárolja a praméterként megkapott dátumot az adatbázisba

////////////////////////
// isAdmin paraméter beállítása
schema.methods.setAdminRight = function setAdminRight(value){
  this.isAdmin = value;
}
// Eltárolja a praméterként megkapott igazságértéket az adatbázisba

////////////////////////
// isTrainer paraméter beállítása
schema.methods.setTrainerRight = function setTrainerRight(value){
  this.isTrainer = value;
}
// Eltárolja a praméterként megkapott igazságértéket az adatbázisba

////////////////////////
// Megerősítési  token beállítása
schema.methods.setConfirmationToken = function setConfirmationToken() {
  this.confirmationToken = this.generateJWT();
};
// Eltárolja a generateJWT() függvény által genrált hash-t

////////////////////////
// Megeerősítési URL generálása
schema.methods.generateConfirmationUrl = function generateConfirmationUrl() {
  return `${process.env.HOST}/confirmation/${this.confirmationToken}`;
};
// A felhasználó fiók ellenőrzéséhez generál egy URL-t
// Ezt az URL-t később email formájában küldi ki a rendszer a felhasználónak

////////////////////////
// Új jelszó igényléséhez URL generálása 
schema.methods.generateResetPasswordLink = function generateResetPasswordLink() {
  return `${process.env.HOST}/reset_password/${this.generateResetPasswordToken()}`;
};
// Elvszett jelszó visszaállításához generál egy URL címet

////////////////////////
// Jason Web Token generálása
schema.methods.generateJWT = function generateJWT() {
  return jwt.sign(
    {
      email: this.email,
      username: this.username,
      isAdmin: this.isAdmin,
      isTrainer: this.isTrainer,
      membership: this.membership
    },
    process.env.JWT_SECRET
  );
};
// Ez a JWT tartalmazza a react alkalmazás működéséhez szükséges user adatokat.
// A tokenben eltárolt adatokat az alkalmazás egy dekóder segítségével olvassa ki, és eltárolja a Redux tárba.

////////////////////////
// Új jelszó igényléséhez szükséges JWT generálása
schema.methods.generateResetPasswordToken = function generateResetPasswordToken() {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
//Generálásra kerül egy token ami elkódolva tartalmazza a szóban forgó felhasználó MongoDB azonosítóját
//A token 1 órán keresztül marad érvényes.


schema.methods.toAuthJSON = function toAuthJSON() {
  return {
    email: this.email,
    username: this.username,
    token: this.generateJWT(),
    isAdmin: this.isAdmin,
    isTrainer: this.isTrainer,
    membership: this.membership
  };
};
// Belépéskor a token mellett natív módon is betöltésre kerülnek az alkalmazás működéséhez szükséges változók.
// isAdmin és isTrainer változóra a megfelelő menüelemek megjelnítéséhez szükséges
// email és username változóra a profiladatok megjelenítéséhez kell

////////////////////////
// Email egyediségének vizsgálata
schema.plugin(uniqueValidator, { message: "Ez az email cím már foglalt!" });
// A felhasználó létrehozásakor ezzel a függvénnyel ellenőrizhető a megadott email cím egyedisége a rendszerben.
// Nem egyedi cím esetén a "message" válltozó tartalmát adja vissza a függvény.

export default mongoose.model("User", schema);
