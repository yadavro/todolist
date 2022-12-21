//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect("mongodb+srv://admin-Rohit:octInHKlTVtetHwY@cluster0.wuzx9bp.mongodb.net/todolistDB");
// mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");
mongoose.set('strictQuery', false);
const itemsSchema=new mongoose.Schema({
name:String
});
const Item=mongoose.model("Item",itemsSchema);
const food=new Item({
  name:"Buy Food"
});
const cook=new Item({
  name:"Cook Food"
});
const eat=new Item({
  name:"Eat Food"
});
const defaultItems=[food,cook,eat];

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});
const List=mongoose.model("List",listSchema);
// Item.insertMany(defaultItems,function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Successfully inserted three items");
//   }
// });

app.get("/", function(req, res) {

Item.find({},function(err,foundItems){
  // console.log(foundItems);
  // foundItems is  an array returned by the function on satisfying the condition
  if(foundItems.length === 0){
    // console.log(foundItems.length);
     Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully inserted three items");
      }
    });
    res.redirect("/");
  }else{
  res.render("list", {listTitle: "Today", newListItems:foundItems});
}
});
// const day = date.getDate();
  // res.render("list", {listTitle: "Today", newListItems: items});


});

app.post("/", function(req, res){
  const listName=req.body.list;
  const itemName = req.body.newItem;
const item=new Item({
  name:itemName
});
if(listName ==="Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
const checkedItem=req.body.checkbox;
const listName=req.body.listName;
if(listName ==="Today"){
  Item.deleteOne({_id:checkedItem},function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Succesfully deleted");
    }
  });
  res.redirect("/");
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,results){
  if(err){
    console.log(err);
  }  else{
    res.redirect("/"+listName);
  }
  });
}

});



app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(err){
      console.log(err);
    }else{
      if(!foundList){
        // console.log("Doesn't exist !");
        // create a new list
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        // console.log("Exists!");
          res.render("list", {listTitle:foundList.name , newListItems:foundList.items});
      }
    }
  });



});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.Port || 3000, function() {
  console.log("Server started on port 3000");
});
