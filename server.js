const express = require('express');
const routes = require('./routes/router');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 80;

// Set ejs template engine
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const accessLogStream = rfs.createStream('access.log', {
	interval: '1d', // rotate daily
	path: path.join(__dirname, 'logs'),
	size: '10M'
});

app.use(morgan('tiny', { stream: accessLogStream }));
app.use(routes);

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
