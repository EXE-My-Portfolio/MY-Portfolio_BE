// import ServerInternalException from "@/common/exception/ServerInternalExeption";
import envConfig from "@/common/config/envConfig";
// import ErrorCode from "@/common/constants/errorCode";
import mongoose from "mongoose";

class dbConnection {
  async connect() {
    try {
      await mongoose.connect(envConfig.mongoUri);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.log(error);
      throw new Error(`DB connection error: ${error}`);
      // throw new ServerInternalException({
      //   errorCode: ErrorCode.INTERNAL_ERROR,
      //   errorMessage: `DB connection error ${error} `,
      // });
    }
  }
}

export default new dbConnection();
