import express from "express";
import userAuth from "../../Controller/UserAuthController/UserAuth";
const router = express.Router();
import MongoClient, { Db } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const userAuthController = new userAuth();

router.post("/api/user-signup", (request, response) => {
  userAuthController.SignUp(request, response);
});

router.get("/account-activation/:id", (request, response) => {
  userAuthController.accountActivation(request, response);
});

router.post("/api/user-login", (request, response) => {
  userAuthController.Login(request, response);
});

export default router;
