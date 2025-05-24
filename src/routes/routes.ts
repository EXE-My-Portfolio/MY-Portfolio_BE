import { Router } from "express";
import userRouter from "../modules/user";

const router = Router();
router.use(userRouter);


export default router;
