import request from 'supertest'
import app from '../app';
it("clear cookie when logout", async () => {
    await request(app.app)
      .post("/api/auth/register")
      .send({
        email: "test@gmail.com",
        password: "12345213126689",
      })
      .expect(201);
  const response =   await request(app.app)
      .post("/api/auth/logout")
      .send({})
      .expect(200);

      expect(response.get("Set-Cookie")[0]).toEqual("session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly")
  });
  

