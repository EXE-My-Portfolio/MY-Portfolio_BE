import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./routes/routes";
import env from "./common/config/envConfig";
import helmet from "helmet";
import dbConnect from "./database/dbConnect";
import BaseExceptionHandler from "./common/exception/handler/BaseExceptionHandler";
class App {
  app: Application;

  constructor() {
    this.app = express();
    this.middleware();
    this.routes();
    // this.errorHandler();
  }

  private middleware() {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes() {
    this.app.use("/api/auth", router);
  }

  private errorHandler() {
    this.app.use(
      (error: Error, _req: Request, res: Response, _next: NextFunction) => {
        BaseExceptionHandler.handleError(error, res);
      }
    );
  }

  public async listen() {
    const PORT = 4000;
    const HOST = "localhost";
    try {
      dbConnect.connect();
      this.app.listen(PORT, () => {
        console.log(`Server running at ${HOST}:${PORT}/api/auth`);
      });
    } catch (error) {
      console.log(error);
    }
  }
}
export default new App();
