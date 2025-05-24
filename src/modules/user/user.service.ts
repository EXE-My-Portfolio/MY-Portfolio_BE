import ErrorCode from "@/common/constants/errorCode";
import hashing from "@/common/utils/hashing";
import Jwt from "@/common/utils/Jwt";
import { Gender, PriceNotification, User } from "@/database";
import BadRequestException from "@/common/exception/BadRequestException";
import UnauthorizedExeption from "@/common/exception/UnauthorizedExeption";
import ForbiddenException from "@/common/exception/ForbiddenException";
// import redis, { sendSignal } from "@/redis/redisClient";

class UserService {
  async createActiveUser(fullName: string, email: string) {
    return await User.create({
      fullName,
      email,
      state: "active",
    });
  }
  async register(
    fullName: string,
    email: string,
    password: string,
    gender: Gender,
    dob: Date
  ) {
    const userExist = await User.findOne({ email });
    if (userExist) {
      throw new BadRequestException({
        errorCode: ErrorCode.EXIST,
        errorMessage: "Email has been registered",
      });
    }
    const hashedPassword = await hashing.hashPassword(password);
    const newUser = User.build({
      fullName,
      email,
      password: hashedPassword,
      gender,
      dob,
    });
    return await newUser.save();
  }

  async verifyEmail(encryptEmail: string) {
    const token = decodeURIComponent(encryptEmail);
    const { email } = Jwt.verifyEmailToken(token);
    const userExist = await User.findOne({ email });
    if (!userExist) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: "Not found user",
      });
    }
    userExist.state = "active";
    // sendSignal("auth", userExist._id as string);
    await userExist.save();
  }
  async login(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: "Not found user with this email",
      });
    }
    if (user.role == "blocker") {
      throw new ForbiddenException({
        errorCode: ErrorCode.BLOCKED,
        errorMessage: "You are blocked",
      });
    }
    if (user.state !== "active") {
      throw new BadRequestException({
        errorCode: ErrorCode.VERIFY_EMAIL_NEED,
        errorMessage: "You need to verify email",
      });
    }

    const isCorrectPassword = await hashing.comparePassword(
      password,
      user.password
    );
    if (!isCorrectPassword)
      throw new UnauthorizedExeption({
        errorCode: ErrorCode.INCORRECT,
        errorMessage: "Incorrect password",
      });
    const accessToken = Jwt.generateAccessToken(user.id, user.role);
    const refreshToken = Jwt.generateRefreshToken(user.id);
    // redis.set(String(user._id), JSON.stringify(user));
    return { accessToken, refreshToken };
  }

  async findUserById(_id: string) {
    return await User.findOne({ _id });
  }

  async findUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  async changePassword(email: string, password: string) {
    const hashedPassword = await hashing.hashPassword(password);
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: "Not found user",
      });
    }
    user.password = hashedPassword;
    await user.save();
  }

  async blockUser(uid: string) {
    const user = await User.findOne({ _id: uid });
    if (!user) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: "Not found user",
      });
    }
    user.role = "blocker";
    await user.save();
  }

  async blockUsers(uids: string[]) {
    const users = await User.find({ _id: { $in: uids } });
    if (!users.length) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: "No users found",
      });
    }

    await User.updateMany(
      { _id: { $in: uids } },
      { $set: { role: "blocker" } }
    );
  }

  async unblockUsers(uids: string[]) {
    const users = await User.find({ _id: { $in: uids } });
    if (!users.length) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: "No users found",
      });
    }

    await User.updateMany({ _id: { $in: uids } }, { $set: { role: "user" } });
  }

  // async toggleNotification(uid: string) {
  //   const user = await User.findById(uid);
  //   if (!user) {
  //     throw new BadRequestException({
  //       errorCode: ErrorCode.NOT_FOUND,
  //       errorMessage: "Not found user",
  //     });
  //   }
  //   user.isGetMailNotify = !!!user.isGetMailNotify;
  //   // redis.set(String(user._id), JSON.stringify(user));
  //   await user.save();
  // }

  // async updatePriceNotification(
  //   uid: string,
  //   notifications: Omit<PriceNotification, "isActive">[]
  // ) {
  //   const user = await User.findById(uid);
  //   if (!user) {
  //     throw new BadRequestException({
  //       errorCode: ErrorCode.NOT_FOUND,
  //       errorMessage: "Not found user",
  //     });
  //   }
  //   user.priceNotifications = notifications.map((notification) => ({
  //     ...notification,
  //     isActive: true,
  //   }));
  //   await user.save();
  // }
  async findAllUsers() {
    const users = await User.find({ role: ["user", "blocker"] });
    if (!users.length) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: "No users found",
      });
    }
    return users;
  }

  // async generateRandomUser() {
  //   const randomName = "VO KIET";
  //   const randomEmail = `user${Math.floor(Math.random() * 10000)}@gmail.com`;
  //   const randomCic = `04${Math.floor(Math.random() * 1000000000)}`;
  //   const randomDob = new Date(
  //     2000 + Math.floor(Math.random() * 25),
  //     Math.floor(Math.random() * 12),
  //     Math.floor(Math.random() * 28)
  //   ).toISOString();
  //   const randomCampus = Math.random() > 0.5 ? "DaNang" : "HoaLac";
  //   const randomState = Math.random() > 0.5 ? "pending" : "active";
  //   const newUser = User.build({
  //     fullName: randomName,
  //     email: randomEmail,
  //     password: "$2a$10$8vP93sbwOT.INXrdn5qKdOyL5mWER.hIswGLVPYn6YoWpdUjo.Svq",
  //     cic: randomCic,
  //     gender: "male",
  //     dob: new Date(randomDob),
  //     campus: randomCampus,
  //   });
  //   newUser.state = randomState;
  //   return await newUser.save();
  // }
  async deleteUserMockup() {
    try {
      const regex = /^user\d{1,4}@gmail\.com$/;
      const result = await User.deleteMany({
        email: { $regex: regex },
      });
    } catch (error) {
      console.error("Error deleting users:", error);
    }
  }
}
export default new UserService();
