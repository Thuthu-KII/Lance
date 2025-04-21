const request  = require('supertest');
const app = require('../routes/index.js');


describe('Auth routes', ()=>{
    it('should load /login route', async ()=>{
        const res = await request(app).get('/login');
        expect(res.statusCode).toBe(200);
    });
});

/**
 * @jest-environment jsdom
 */

const { selectRole, signUp, login } = require('../public/login'); 

describe('Authentication Functions', () => {

  beforeEach(() => {
    // Set up basic HTML structure for each test
    document.body.innerHTML = `
      <div id="role-selection"></div>
      <div id="Sign-up-section"></div>
      <span id="user-role"></span>
      <input id="email" />
      <input id="password" />
    `;
    localStorage.clear();
  });

  describe('selectRole()', () => {
    test('sets role in localStorage', () => {
      selectRole('Farmer');
      expect(localStorage.getItem('userRole')).toBe('Farmer');
    });

    test('updates the UI to reflect selected role', () => {
      selectRole('Client');
      expect(document.getElementById('user-role').innerText).toBe('Client');
    });

    test('hides role-selection and shows sign-up section', () => {
      selectRole('Freelancer');
      expect(document.getElementById('role-selection').style.display).toBe('none');
      expect(document.getElementById('Sign-up-section').style.display).toBe('block');
    });
  });

  describe('signUp()', () => {
    test('retrieves email, password, and role and shows alert', () => {
      // Set up values
      document.getElementById('email').value = 'test@example.com';
      document.getElementById('password').value = 'pass123';
      localStorage.setItem('userRole', 'Freelancer');

      // Mock alert
      global.alert = jest.fn();

      signUp();

      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Logging in as a Freelancer'));
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Email: test@example.com'));
    });
  });

  describe('login()', () => {
    test('login function exists and is callable', () => {
      expect(typeof login).toBe('function');
    });

    test('currently does nothing (placeholder)', () => {
      // You can enhance this when login logic is added
      const result = login(); // Should be undefined
      expect(result).toBeUndefined();
    });
  });
});
