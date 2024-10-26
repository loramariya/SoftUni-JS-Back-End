import express from 'express';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import routes from './routes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

const app = express();

//Setup db
const url = 'mongodb://localhost:27017';
//TODO: change db name
mongoose.connect(url, { dbName: 'volcanoes' })
    .then(() => console.log('DB connected!'))
    .catch((err) => console.log(`DB failed: ${err}`));


//Setup view engine
app.engine('hbs', handlebars.engine({
    extname: 'hbs',
}));
app.set('views', 'src/views');
app.set('view engine', 'hbs');

//Setup express
app.use('/static', express.static('src/public'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(authMiddleware);
app.use(routes);

app.listen(3000, () => console.log('Server listening on http://localhost:3000'));