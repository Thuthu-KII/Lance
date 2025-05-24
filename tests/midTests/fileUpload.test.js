/**
 * @jest-environment node
 */


const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { upload } = require('../../middleware/fileUpload'); // Adjust the path as needed

const app = express();

app.post('/upload', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'clearance', maxCount: 1 }
]), (req, res) => {
  res.status(200).json({ message: 'Files uploaded successfully', files: req.files });
});

describe('Upload Middleware', () => {
  const testFilesDir = path.join(__dirname, 'test-files');

  beforeAll(() => {
    if (!fs.existsSync(testFilesDir)) fs.mkdirSync(testFilesDir);
    fs.writeFileSync(path.join(testFilesDir, 'test.pdf'), 'Dummy content');
    fs.writeFileSync(path.join(testFilesDir, 'test.exe'), 'Executable content');
  });

  afterAll(() => {
    fs.rmSync(testFilesDir, { recursive: true, force: true });
  });

  it('should upload a valid CV file', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('cv', path.join(testFilesDir, 'test.pdf'));

    expect(res.status).toBe(200);
    expect(res.body.files.cv).toBeDefined();
    expect(res.body.files.cv[0].originalname).toBe('test.pdf');
  });

  it('should reject unsupported file types', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('cv', path.join(testFilesDir, 'test.exe'));

    expect(res.status).toBe(500); // multer throws error, resulting in Express error handling
    expect(res.text).toMatch(/Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed/);
  });

  it('should reject upload with an invalid field name', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('invalidField', path.join(testFilesDir, 'test.pdf'));

    expect(res.status).toBe(500);
    expect(res.text).toMatch(/Invalid file field/);
  });

  it('should reject files larger than 5MB', async () => {
    const bigFilePath = path.join(testFilesDir, 'bigfile.pdf');
    fs.writeFileSync(bigFilePath, Buffer.alloc(6 * 1024 * 1024)); // 6MB

    const res = await request(app)
      .post('/upload')
      .attach('cv', bigFilePath);

    expect(res.status).toBe(500);
    expect(res.text).toMatch(/File too large/);
  });
});
