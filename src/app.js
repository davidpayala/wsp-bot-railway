import express from 'express'

const app = express()

app.get ('/',(req,res) => {
    res.send('Welcome to Server')
})

app.listen(3001)
console.log ('Server on port 3001')