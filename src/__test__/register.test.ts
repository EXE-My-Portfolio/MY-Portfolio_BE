import request from "supertest";
import app from "../app";
it("return a 201 on successful register", async () => {
  return request(app.app)
    .post("/api/auth/register")
    .send({
      email: "test@example.com",
      password: "12345213126689",
    })
    .expect(201);
});
it("return a 400 on invalid sign up body", async () => {
  await request(app.app)
    .post("/api/auth/register")
    .send({
      email: "test",
      password: "12345213126689",
    })
    .expect(400);
  await request(app.app)
    .post("/api/auth/register")
    .send({
      email: "test@gmail.com",
      password: "12",
    })
    .expect(400);
});
it("return a 400 on empty email or password", async () => {
  await request(app.app)
    .post("/api/auth/register")
    .send({
      password: "12345213126689",
    })
    .expect(400);
  await request(app.app)
    .post("/api/auth/register")
    .send({
      email: "test@gmail.com",
    })
    .expect(400);
});

it("return a 400 on duplicate email", async () => {
  await request(app.app)
    .post("/api/auth/register")
    .send({
      email: "test@gmail.com",
      password: "12345213126689",
      confirmPassword: "12345213126689"
    })
    .expect(201);
  await request(app.app)
    .post("/api/auth/register")
    .send({
      email: "test@gmail.com",
      password: "12345213126689",
      confirmPassword: "12345213126689"
    })
    .expect(400);
});

it("set cookie after successful register", async () => {
    const response = await request(app.app)
    .post("/api/auth/register")
    .send({
      email: "test@gmail.com",
      password: "12345213126689",
      confirmPassword: "12345213126689"
    })
    .expect(201);
    expect(response.get('Set-Cookie')).toBeDefined();
})