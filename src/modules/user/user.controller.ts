import sendVerifyLink from "@/common/heplers/sendVerifyLink";
import ErrorCode from "@/common/constants/errorCode";
import { validationResult } from "express-validator";
import { HttpStatusCode } from "@/common/constants";
import { NextFunction, Request } from "express";
import hashing from "@/common/utils/hashing";
import userService from "./user.service";
import Jwt from "@/common/utils/Jwt";
import BadRequestException from "@/common/exception/BadRequestException";
import { RequestCustom, ResponseCustom } from "@/common/interfaces/express";
import envConfig from "@/common/config/envConfig";
// import redis, { sendSignal } from "@/redis/redisClient";
import format from "@/common/utils/format";
class UserController {
  async register(
    request: Request,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) throw new BadRequestException(errors.array());
      const { fullName, email, password, gender, dob } = request.body;
      const user = await userService.register(
        fullName,
        email,
        password,
        gender,
        dob
      );
      // redis.set(String(user._id), JSON.stringify(user));
      return sendVerifyLink(response, user.email, "verify");
    } catch (error) {
      next(error);
    }
  }

  async loginGoogle(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    const { name, email } = request.data as { name: string; email: string };
    try {
      const userExist = await userService.findUserByEmail(email);
      if (!userExist) {
        const user = await userService.createActiveUser(name, email);
        // redis.set(String(user._id), JSON.stringify(user));
        // sendSignal('auth', user._id as string);
        return response.status(HttpStatusCode.OK).json({
          httpStatusCode: HttpStatusCode.OK,
          data: {
            accessToken: Jwt.generateAccessToken(user.id, user.role),
            refreshToken: Jwt.generateRefreshToken(user.id),
          },
        });
      }
      // redis.set(String(userExist._id), JSON.stringify(userExist));
      return response.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: {
          accessToken: Jwt.generateAccessToken(userExist.id, userExist.role),
          refreshToken: Jwt.generateRefreshToken(userExist.id),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(
    request: Request,
    response: ResponseCustom,
    next: NextFunction
  ) {
    const { encryptEmail } = request.params;
    try {
      if (!encryptEmail) {
        throw new BadRequestException({
          errorCode: ErrorCode.FAILED_VALIDATE_BODY,
          errorMessage: "Invalid verification",
        });
      }
      await userService.verifyEmail(encryptEmail);
      console.log(envConfig.verifyReturnUrl);
      response.redirect(envConfig.verifyReturnUrl as string);
    } catch (error: any) {
      if (error.name === "TokenExpiredError")
        console.log(envConfig.verifyExpiredUrl);
      response.redirect(envConfig.verifyExpiredUrl as string);
    }
  }
  async verifyEmailLink(
    request: Request,
    response: ResponseCustom,
    next: NextFunction
  ) {
    const { email } = request.body;
    console.log(email);
    try {
      if (!email) {
        throw new BadRequestException({
          errorCode: ErrorCode.FAILED_VALIDATE_BODY,
          errorMessage: "Email is required",
        });
      }
      const userExist = await userService.findUserByEmail(email);
      if (!userExist || userExist.state === "active") {
        throw new BadRequestException({
          errorCode: ErrorCode.NOT_FOUND,
          errorMessage: "Not found unverify user",
        });
      }
      sendVerifyLink(response, email, "verify");
    } catch (error) {
      next(error);
    }
  }

  async login(request: Request, response: ResponseCustom, next: NextFunction) {
    try {
      const { email, password } = request.body;
      const error = validationResult(request);
      if (!error.isEmpty()) throw new BadRequestException(error.array());
      const { accessToken, refreshToken } = await userService.login(
        email,
        password
      );
      return response.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: { accessToken, refreshToken },
      });
    } catch (error) {
      next(error);
    }
  }
  async userProfile(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    const { uid } = request.userInfo;
    try {
      const user = await userService.findUserById(uid);
      if (!user)
        throw new BadRequestException({
          errorCode: ErrorCode.NOT_FOUND,
          errorMessage: "User not found",
        });
      const { email, fullName, role, state, dob, gender } = user;
      const uidFormat = format.formatUID(uid);
      const data = {
        uid: uidFormat,
        email,
        fullName,
        dob,
        gender,
        role,
        state,
      };
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK, data });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(
    request: Request,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const error = validationResult(request);
      if (!error.isEmpty()) throw new BadRequestException(error.array());
      const { email } = request.body;
      const userExist = await userService.findUserByEmail(email);
      if (!userExist) {
        throw new BadRequestException({
          errorCode: ErrorCode.NOT_FOUND,
          errorMessage: "Not found user",
        });
      }
      sendVerifyLink(
        response,
        email,
        "resetPassword",
        envConfig.forgotPasswordReturnUrl
      );
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(
    request: Request,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) throw new BadRequestException(errors.array());
      const { newPassword, resetToken } = request.body;
      const token = decodeURIComponent(resetToken);
      const { email } = Jwt.verifyEmailToken(token);
      userService.changePassword(email, newPassword);
      return response.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
      });
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          httpStatusCode: HttpStatusCode.BAD_REQUEST,
          errors: [
            {
              errorCode: ErrorCode.TOKEN_EXPIRED,
              errorMessage: "Your token is expired",
            },
          ],
        });
      }
      next(error);
    }
  }

  async refreshToken(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    const uid = request.data;
    try {
      const userExist = await userService.findUserById(uid);
      if (!userExist) {
        throw new BadRequestException({
          errorCode: ErrorCode.NOT_FOUND,
          errorMessage: "Not found user",
        });
      }
      const accessToken = Jwt.generateAccessToken(userExist.id, userExist.role);
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK, data: { accessToken } });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { oldPassword, newPassword } = request.body;
      const { uid } = request.userInfo;
      if (!newPassword) {
        throw new BadRequestException({
          errorCode: ErrorCode.FAILED_VALIDATE_BODY,
          errorMessage: "New password is require",
        });
      }
      const userExist = await userService.findUserById(uid);
      if (!userExist) {
        throw new BadRequestException({
          errorCode: ErrorCode.NOT_FOUND,
          errorMessage: "Not found user",
        });
      }
      const isPasswordMatch = await hashing.comparePassword(
        oldPassword,
        userExist.password
      );
      if (!isPasswordMatch) {
        throw new BadRequestException({
          errorCode: ErrorCode.NOT_FOUND,
          errorMessage: "Old password is wrong",
        });
      }

      userService.changePassword(userExist.email, newPassword);
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK });
    } catch (error) {
      next(error);
    }
  }

  // async toggleNotification(
  //   request: RequestCustom,
  //   response: ResponseCustom,
  //   next: NextFunction
  // ) {
  //   try {
  //     const { uid } = request.userInfo;
  //     await userService.toggleNotification(uid);

  //     return response
  //       .status(HttpStatusCode.OK)
  //       .json({ httpStatusCode: HttpStatusCode.OK });
  //   } catch (error) {
  //     next(error);
  //   }
  // }
  // async updatePriceNotification(
  //   request: RequestCustom,
  //   response: ResponseCustom,
  //   next: NextFunction
  // ) {
  //   try {
  //     const { uid } = request.userInfo;
  //     const { notifications } = request.body;
  //     await userService.updatePriceNotification(uid, notifications);
  //     return response
  //       .status(HttpStatusCode.OK)
  //       .json({ httpStatusCode: HttpStatusCode.OK });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // admin method
  async blockUsers(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uids } = request.body;
      await userService.blockUsers(uids);
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK });
    } catch (error) {
      next(error);
    }
  }

  async unblockUsers(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uids } = request.body;
      await userService.unblockUsers(uids);
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK });
    } catch (error) {
      next(error);
    }
  }

  async getToTalInfoUser(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const data = await userService.findAllUsers();
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK, data });
    } catch (error) {
      next(error);
    }
  }

  // fetchMockUser(
  //   _request: RequestCustom,
  //   response: ResponseCustom,
  //   _next: NextFunction
  // ) {
  //   Array.from({ length: 100 }, () => userService.generateRandomUser());
  //   return response
  //     .status(HttpStatusCode.OK)
  //     .json({ httpStatusCode: HttpStatusCode.OK, data: true });
  // }
  async deleteMockUser(
    _request: RequestCustom,
    response: ResponseCustom,
    _next: NextFunction
  ) {
    await userService.deleteUserMockup();
    return response
      .status(HttpStatusCode.OK)
      .json({ httpStatusCode: HttpStatusCode.OK, data: true });
  }
}
export default new UserController();
