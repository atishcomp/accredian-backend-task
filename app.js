var express =require("express");
var mysql =require("mysql");
var cors =require("cors");
var bcrypt = require('bcrypt')


const app = express();
app.use(cors());
app.use(express.json())

const db= mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'accrediandb'
})


app.get('/',(req,res)=>{
    const sql = 'SELECT * FROM users';
    db.query(sql,(err,result)=>{
        if(err) return res.json({"Message":"internal server error"})
        return res.json(result)
    })
})

app.post('/signup',async (req,res)=>{
    const sql= "INSERT INTO users (`id`,`username`,`email`,`password`) VALUES (?)";
 
    const hashPassword= await bcrypt.hash(req.body.password,10)

     const values=[
        req.body.id,
        req.body.username,
        req.body.email,
        hashPassword
     ]

     db.query(sql,[values],(err,result)=>{
        if(err) return res.json(err);
        return res.json(result)
     })
      
})

app.get('/login',(req,res)=>{
    const searchColumn= 'username'
    const {username,password}=req.query;

    const sql= `SELECT * FROM users WHERE ${searchColumn} = ?`;
   
    try {
        db.query(sql,[username],async(err,result)=>{
            if(err) return res.json(err);
             
            if(result.length>0){
                if(result[0].username==username){
                    const isMatch= await bcrypt.compare(password,result[0].password)
                    console.log(isMatch,"is match")
                    if(isMatch==true)
                    return res.json({"Message":"Login Successful"})
                    else 
                    return res.json({"Message":"Wrong Password"})
                 }else{
                    return res.json({"Message":"Invalid Credentials"})
                 }
            }else return res.json({"Message":"User does not exist"})
         })
    } catch (error) {
         return res.json({"Message":"Error occurred during login"})
    }
      
})

app.listen(8081,()=>{
    console.log("LISTENING...")
})
