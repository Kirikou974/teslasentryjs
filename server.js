const express = require('express');
const routes = require('./routes/router');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();

// Set ejs template engine
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});