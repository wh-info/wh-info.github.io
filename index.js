const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const {serverTCP} = require('./decode');
const logger = require('./logger');

const app = express();

app.use(express.static('dist'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());
app.use(bodyParser.json());

require('./routes')(app);

app.get('/*', (req, res) => {
    res.sendFile('index.html', {root: path.join(__dirname, '/../../dist')});
});

const portHTTP = process.env.PORT || 3000;
const portTCP = 8999;

app.listen(portHTTP, () => logger.info(`Listening on port ${portHTTP}!`));
serverTCP.listen(portTCP, () => {
    logger.info(`Start App on TCPPort: ${portTCP}`);
});

