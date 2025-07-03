const request = require ('supertest')
const app = require ('../server') // make sure to export app separately
const mongoose = require("mongoose");

describe('Competence API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('GET /competences should return all competences', async () => {
    const res = await request(app).get('/competences')
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})
