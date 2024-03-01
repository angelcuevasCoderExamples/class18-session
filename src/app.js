const express = require('express');
const port = 8080; 
const session = require('express-session')

const app = express();
app.use(session({
    secret:'ourSecret',
    resave: true, 
    saveUninitialized: true 
}))

app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.get('/session',(req, res)=>{
    if(req.session.counter){
        req.session.counter++;
        res.send(`Site visited ${req.session.counter} times`)
    }else{
        req.session.counter = 1;
        res.send('welcome! first visit!')
    }
})

app.get('/delete', (req, res)=>{
    req.session.destroy((err)=>{
        if(err) {
            return res.send({status:'error', error: err})
        }

        res.send('Session ended')
    })
})

const users = [//pseudo base de datos
    {username:'johndoe', password:1234, isAdmin:true},
    {username:'janeDoe', password:1234, isAdmin:false}
] 

app.get('/login', (req, res)=>{
    const {username, password} = req.query; 

    const user = users.find(u=>u.username == username && u.password == password);
    if(!user){
        return res.status(400).send('login failed')
    }  

    req.session.username = username;
    req.session.admin = user.isAdmin; 
    req.session.visitCounter= 1; 

    res.send({stats:'sucessful login', isAdmin: req.session.admin })
})


function authenticate(req, res, next){

    if(req.session.username){
        return next()
    }

    res.status(400).send('not authenticated')
}

app.get('/private',authenticate,(req, res)=>{

    const name = req.query.name || '' 

    req.session.visitCounter++; 

    res.send(`Bienvenido ${name},
    Si estas viendo esto es porque ya te logueaste
    Nº de visitas: ${req.session.visitCounter}`)
})

app.listen(port, ()=>console.log(`up and running on port ${port}`))