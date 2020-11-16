import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userAuthRoute from "./Routes/UserAuth/UserAuth";
import expressSession from "express-session";
import MongoDBStore from "connect-mongodb-session";
dotenv.config();
const app = express();

//======================================================MIDDLEWARE======================================================
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  })
);

const sessionSchema = mongoose.Schema({
  expires: { type: Date, required: true },
  session: { type: Object },
});

const session = mongoose.model("sessions", sessionSchema);

//==============================================MongoDB configs and connection==========================================
const mongoURI = process.env.mongoURI;
const mongoDB__connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};
mongoose.connect(mongoURI, mongoDB__connectionOptions, (error) => {
  if (error) {
    return console.log(error);
  }
  return console.log("Connection to MongoDB was successfull");
});

//===============================================Express-Session Configs================================================
const mongoStore = MongoDBStore(expressSession);
const cookieExpiresAt = 365 * 24 * 60 * 60 * 1000; //Full year
const store = new mongoStore({
  collection: session,
  uri: process.env.mongoURI,
  clear_interval: 3600,
});

store.on("error", (error) => {
  console.log(error);
});

app.use(
  expressSession({
    name: "SESS_NAME",
    secret: "SESS_SECRET",
    store: store,
    saveUninitialized: false,
    resave: false,
    cookie: {
      sameSite: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: cookieExpiresAt,
      httpOnly: true,
    },
  })
);
//=================================================Server ENDPOINTS=====================================================
app.use(userAuthRoute);

//===============================================Server configs and connection==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started at PORT ${PORT}`);
});
