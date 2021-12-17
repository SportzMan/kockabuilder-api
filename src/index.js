import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Promise from "bluebird";

import auth from "./routes/auth.js";
import users from "./routes/users.js";
import exercises from "./routes/exercises.js";
import workouts from "./routes/workouts.js";
import programs from "./routes/programs.js";
import purchases from "./routes/purchases.js";
import events from "./routes/events.js";


dotenv.config();
var app = express();
app.use(bodyParser.json());


mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });


app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/exercises", exercises);
app.use("/api/workouts", workouts);
app.use("/api/programs", programs);
app.use("/api/purchases", purchases);
app.use("/api/events", events);

app.use('/uploads', express.static('uploads'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(8080, () => console.log('Running on localhots:8080'));