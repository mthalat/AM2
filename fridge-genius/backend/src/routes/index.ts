import { Router, type IRouter } from "express";
import healthRouter from "./health";
import fridgeRouter from "./fridge";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/fridge", fridgeRouter);

export default router;
