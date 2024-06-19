//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://shayaanhaquedgp:Shayaan_6565@cluster0.7dg9bqy.mongodb.net/todolistDB", {useNewUrlParser:true});

const ItemsSchema = new mongoose.Schema({
   name:String
})

const Item = mongoose.model('Item', ItemsSchema);

const  item1 = new Item ({
  name:'work'
});

const  item2 = new Item ({
  name:'work here'
});

const  item3 = new Item ({
  name:'work now'
});

const  item4 = new Item ({
  name:'work now from here' 
});

const defaultItems=[item1,item2,item3,item4];


const ListSchema = new mongoose.Schema({
  name:String,
  Items : [ItemsSchema]
})

const List = mongoose.model("List",ListSchema);

app.get("/", async function(req, res) {
    
  try{
    const foundItems= await Item.find({});
    if(foundItems.length==0)
    {
      try { 
        await Item.insertMany(defaultItems);
        console.log("Successfully saved default items to database");
    } catch (err) {
      console.log(err);
    }
    res.redirect("/");
    }
    else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
}
catch(err)
{
  console.log(err);
}
});

app.post("/", async function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({ 
    name: itemName 
  });

  try {
    if (listName === "Today") {
      await item.save();
      res.redirect("/");
    } else {
      const foundList = await List.findOne({ name: listName });
      
        foundList.Items.push(item); 
        await foundList.save();
        res.redirect("/" + listName);
  
    }
  } catch (err) {
    console.error("Error occurred:", err);
    res.redirect("/");
  }
});



app.post("/delete", async function(req, res) {
  const checkboxId = req.body.checkbox;
  const listName = req.body.listname;
  
  if (listName === "Today") {
    try {
      await Item.findOneAndDelete({ _id: checkboxId });
      console.log("Successfully deleted");
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.redirect("/");
    }
  } else {
    try {
      await List.findOneAndUpdate(
        { name: listName },
        { $pull: { Items: { _id: checkboxId } } }
      );
      res.redirect("/" + listName);
    } catch (err) {
      console.error(err);
      res.redirect("/");
    }
  }
});
 

 app.get("/:customListName", async function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  try {
    const foundList = await List.findOne({ name: customListName });
    if (!foundList) {
      
        const list = new List
        ({
           name : customListName,
           items : defaultItems
        });
        list.save(); 

        res.redirect("/"+customListName);
    } else {
      
     res.render("list", {listTitle: foundList.name, newListItems: foundList.Items});
    }
  } catch (err) {
    console.error("Error occurred:", err);
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});