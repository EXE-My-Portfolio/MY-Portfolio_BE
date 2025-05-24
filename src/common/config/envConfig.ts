import dotenv from "dotenv";
dotenv.config();

class ENVConfig {
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  }
  get portServer(): number {
    return Number(process.env.PORT)!;
  }
  get JWTSecretKey(): string {
    return process.env.JWT_SECRET_KEY!;
  }

  get JWTRefreshSecretKey(): string {
    return process.env.JWT_SECRET_REFRESH_KEY!;
  }

  get getHost(): string {
    return process.env.HOST!;
  }

  get getAccessTokenExpireTime(): string {
    return process.env.EXPIRE_ACCESS_IN!;
  }
  get getRefreshTokenExpireTime(): string {
    return process.env.EXPIRE_REFRESH_IN!;
  }
  get mongoUri(): string {
    return process.env.MONGO_URI!;
  }
  get mailAccount(): string {
    return process.env.MAIL_ACCOUNT!;
  }

  get mailAppPassword(): string {
    return process.env.MAIL_APP_PASSWORD!;
  }
  get verifyReturnUrl(): string {
    return process.env.VERIFY_RETURN_URL!;
  }
  get verifyExpiredUrl(): string {
    return process.env.VERIFY_EXPIRED_URL!;
  }
  get forgotPasswordReturnUrl(): string {
    return process.env.FORGOT_PASSWORD_RETURN_URL!;
  }
  get apiUrl(): string {
    return process.env.API_URL!;
  }

  get dataApiUrl(): string {
    return process.env.DATA_API_URL!;
  }

  get redisHost(): string {
    return process.env.REDIS_HOST!;
  }

}
const envConfig = new ENVConfig();
export default envConfig;
