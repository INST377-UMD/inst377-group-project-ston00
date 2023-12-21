const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const port = 4000;
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile('public/index.html', {root:__dirname});
});

app.post('/thankyou.html', async (req,res) => {
    res.sendFile('public/thankyou.html', {root:__dirname});
}); 

app.listen(port, ()=> {
    console.log('App is up');
});