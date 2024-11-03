import {
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "@/controllers/user.controller";
import { auth } from "@/middlewares/auth";
import { Role } from "@prisma/client";
import { Router } from "express";

const userRouter = Router();

userRouter.get("/", auth(), getUsers);
userRouter.get("/:id", auth(Role.ADMIN, Role.USER), getUserById);
userRouter.put("/:id", auth(Role.ADMIN, Role.USER), updateUser);
userRouter.delete("/:id", auth(Role.ADMIN, Role.USER), deleteUser);

export default userRouter;
