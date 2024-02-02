const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<password>', process.env.PASSWORD);

// mongoose.set('strictQuery', true);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connected Successfully!!');
  });
// const testTour = new Tour({
//   name: 'THe hikingss in snow',
//   price: 1000,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log('Tour got saved !!!');
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('Error in the code : ', err);
//   }); /////////////////////////////////////////////  saving the document to the 'DATABASE'

const port = process.env.PORT;
// console.log(app.get('env'));
// console.log(process.env);
app.listen(port, () => {
  console.log(`App running on port ${port}.........`);
});
