const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const connectDb = require('./db/db');
const userRouter = require('./router/userRouter');
const transactionRouter = require('./router/transactionRouter');
const expenseRouter = require('./router/expenseRouter');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', userRouter);
app.use('/transactions', transactionRouter);
app.use('/expenses', expenseRouter);

const port = process.env.PORT || 4000;
connectDb().then(() => {
    app.listen(port, () => console.log(`Server on :- ${port}`));
});
