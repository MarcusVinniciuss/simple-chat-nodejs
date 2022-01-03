let express = require('express');
let bodyParser = require('body-parser')
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let cors = require('cors')
let mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

let Message = mongoose.model('Message',{
  name : String,
  message : String
})

let dbUrl = 'mongodb+srv://mvinnicius:mvinnicius@cluster0.2ngvf.mongodb.net/SendMessage?retryWrites=true&w=majority'

app.use(cors())

app.all("/messages/*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  return next();
});

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})


app.get('/messages/:user', (req, res) => {
  let user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})


app.post('/messages', async (req, res) => {
  try{
    let message = new Message(req.body);

    let savedMessage = await message.save()
      console.log('saved');

    let censored = await Message.findOne({message:'badword'});
      if(censored)
        await Message.remove({_id: censored.id})
      else
        io.emit('message', req.body);
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('error',error);
  }
  finally{
    console.log('Message Posted')
  }

})



io.on('connection', () =>{
  console.log('a user is connected')
})

mongoose.connect(dbUrl ,{useMongoClient : true} ,(err) => {
  console.log('mongodb connected',err);
})

let server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});
