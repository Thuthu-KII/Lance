require('dotenv').config();
const express = require('express');
const cors = require('cors');

const jobRoutes = require('./routes/jobs');
const clientRoutes = require('./routes/clients');
const lancerRoutes = require('./routes/lancers');
const applyRoutes = require('./routes/apply');

const app = express();


app.use(cors());
app.use(express.json());

app.use('/jobs', jobRoutes);
app.use('/clients', clientRoutes);
app.use('/lancers', lancerRoutes);
app.use('/apply', applyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
