require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jobRoutes = require('./routes/jobs');
const clientRoutes = require('./routes/clients');
const lancerRoutes = require('./routes/lancers');
const applyRoutes = require('./routes/apply')

const app = express();
app.use(bodyParser.json());

app.use('/jobs', jobRoutes);
app.use('/clients', clientRoutes);
app.use('/lancers', lancerRoutes);
app.use('/apply',applyRoutes);
app.use(cors());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
