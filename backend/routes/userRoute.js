import express from "express";
import { loginUser, registerUser, getUserProfile, updateUserProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authMiddleware, getUserProfile);
userRouter.post("/profile", authMiddleware, updateUserProfile);

export default userRouter;
