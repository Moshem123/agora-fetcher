const path = require('path');
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const axios = require('axios');
const compression = require('compression');
const port = '8080';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(compression({ filter: shouldCompress }));

function shouldCompress(req, res) {
    if (req.headers['x-no-compression']) {
        // don't compress responses with this request header
        return false;
    }

    // fallback to standard filter function
    return compression.filter(req, res);
}

// app.get(['/', '/agora'], (req, res) => {
//     const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     console.log(`IP: ${ip} connected!`);
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.post('/proxy', (req, res) => {
    const { url } = req.body;
    return axios.get(url)
        .then(response => res.send(response.data));
});

//if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'build')));

    // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
//}

app.listen(port, e => {
    if (e) throw(e);
    console.log('App running on localhost:' + port);
});
