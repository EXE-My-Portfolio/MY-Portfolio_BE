import request from "supertest";
import app from "../app";
import { getCookie }  from "./setup";
it("get current user when have valid cookie", async () => {
    const cookie = await getCookie();
    const response = await request(app.app)
    .get("/api/auth/current-user")
    .set('Cookie',cookie)
    .send()
    .expect(200);
    expect(response.body.currentUser.email).toEqual('test@example.com')
});

it("fail when don't have cookie", async () => {
  const response = await request(app.app)
  .get("/api/auth/current-user")
  .send()
  .expect(200);
  expect(response.body.currentUser).toEqual(null)
});