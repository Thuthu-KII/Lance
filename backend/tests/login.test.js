const request  = require('supertest');
const app = require('../routes/index.js');


describe('Auth routes', ()=>{
    it('should load /login route', async ()=>{
        const res = await request(app).get('/login');
        expect(res.statusCode).toBe(200);
    });
});