const express = require('express')

const app = express()

app.get('/', async (req, res) => {
    res.send('Number of visits is test')
})
app.listen(8081, () => {
  console.log('Listening on port 8081');
})