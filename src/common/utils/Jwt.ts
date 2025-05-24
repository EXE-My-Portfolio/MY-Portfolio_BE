import jwt from "jsonwebtoken";
import envConfig from "../config/envConfig";
import { UserInfo } from "../interfaces/express";
import BadRequestException from "../exception/BadRequestException";
import ErrorCode from "../constants/errorCode";
class JwtHandler {
  generateAccessToken(uid: string, role: string) {
    const accessToken = jwt.sign(
      {
        uid,
        role
      },
      envConfig.JWTSecretKey,
      { expiresIn: '1h' }
    );

    return accessToken;
  }

  verifyAccessToken(accessToken: string) {
    const payload = jwt.verify(accessToken, envConfig.JWTSecretKey);
    return payload as UserInfo
  }

  generateRefreshToken(uid: string) {
    const refreshToken = jwt.sign(
      {
        uid
      },
      envConfig.JWTRefreshSecretKey,
      { expiresIn: '365d' }
    );

    return refreshToken;
  }



  verifyRefreshToken(refreshToken: string) {
    const payload = jwt.verify(refreshToken, envConfig.JWTRefreshSecretKey);
    return (payload as { uid: string }).uid;
  }

  generateVerifyEmailToken(email: string) {
    const emailToken = jwt.sign(
      {
        email
      },
      envConfig.JWTSecretKey,
      { expiresIn: '5m' }
    );

    return emailToken;
  }

  verifyEmailToken(emailToken: string) {
    try {
      return jwt.verify(emailToken, envConfig.JWTSecretKey) as { email: string };
    } catch (error: any) {
      throw new BadRequestException({
        errorCode: ErrorCode.VERIFY_FAILED,
        errorMessage: "Your session is invalid or expired",
      });
    }
  }

}
export default new JwtHandler()