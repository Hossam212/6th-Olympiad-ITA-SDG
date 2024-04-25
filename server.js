const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
const port = process.env.PORT || 3000;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connected succesfully'));
const server = app.listen(port, () => {
  console.log('Listening for requests on port 3000....');
});

process.on('unhandledRejection', (err) => {
  server.close(() => {
    process.exit(1);
  });
});
module.exports = app;
