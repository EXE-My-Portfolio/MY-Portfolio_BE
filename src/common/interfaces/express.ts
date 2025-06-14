import { Role, State } from "@/database";
import { Request, Response } from "express";

export interface ErrorDetail {
  errorCode: string | number;
  errorMessage: string;
}

export interface BodyResponse {
  httpStatusCode: number;
  data?: any;
  errors?: ErrorDetail[];
}

export type ResponseCustom = Response<BodyResponse>;

export interface UserInfo {
  email: string;
  uid: string;
  role: Role;
  state: State;
}

export type RequestCustom = Request & { userInfo: UserInfo, data: any };
