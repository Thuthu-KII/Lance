const express = require('express');
const bodyParser = require('body-parser');
const jobRoutes = require('./routes/jobs');
const clientRoutes = require('./routes/clients');
const lancerRoutes = require('./routes/lancers');

const app = express();
app.use(bodyParser.json());

app.use('/jobs', jobRoutes);
app.use('/clients', clientRoutes);
app.use('/lancers', lancerRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
