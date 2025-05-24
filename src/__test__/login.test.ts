import request from "supertest";
import app from "../app";
it("fail when a email does not exist", async () => {
  await request(app.app)
    .post("/api/auth/login")
    .send({
      email: "test@gmail.com",
      password: "12345213126689",
    })
    .expect(401);
});
it("login when correct account", async () => {
  await request(app.app)
    .post("/api/auth/register")
    .send({
      email: "test@gmail.com",
      password: "12345213126689",
    })
    .expect(201);

  const response = await request(app.app)
    .post("/api/auth/login")
    .send({
      email: "test@gmail.com",
      password: "12345213126689",
    })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});

it("fails when incorrect password", async () => {
  await request(app.app)
    .post("/api/auth/register")
    .send({
      email: "test@gmail.com",
      password: "12345213126689",
    })
    .expect(201);

  await request(app.app)
    .post("/api/auth/login")
    .send({
      email: "test@gmail.com",
      password: "1das29",
    })
    .expect(400);
});
