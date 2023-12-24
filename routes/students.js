// 引入套件
const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();

// 連接到 MongoDB 資料庫
mongoose.connect('mongodb+srv://steven921206:st1254878@cluster0.hwnfppx.mongodb.net/');
// mongoose.connect('mongodb+srv://admin:admin6631@cluster0.em8n9ep.mongodb.net/?retryWrites=true&w=majority'); // 連結雲端Atlas
const db = mongoose.connection;

// 與資料庫連線發生錯誤時
db.on('error', console.error.bind(console, 'Connection fails!'));

// 與資料庫連線成功連線時
db.once('open', function () {
    console.log('Connected to database...');
});
// 該collection的格式設定
const FoodSchema = new mongoose.Schema({
    Date: { 
        type: String,
        required: true 
    },
    foodname: { //是否已完成
        type: String,
        required: true,
        default: 0 //設定預設值
    },
    food_protein: { //新增的時間
        type: Number,
        required: true
    },
    food_carbs: { //新增的時間
        type: Number,
        required: true
    },
    food_fats: { //新增的時間
        type: Number,
        required: true
    },
    food_calories: { //新增的時間
        type: Number,
        required: true
    },
})

const Foods = mongoose.model('Foods', FoodSchema);

router.get("/", async (req, res) => {
    // 使用try catch方便Debug的報錯訊息
    try {
        // 找出Todo資料資料表中的全部資料
        const food = await Foods.find();
        // 將回傳的資訊轉成Json格式後回傳
        res.json(food);
    } catch (err) {
        // 如果資料庫出現錯誤時回報 status:500 並回傳錯誤訊息 
        res.status(500).json({ message: err.message })
    }
});
// 新增待辦事項
// 將Method改為Post
router.post("/", async (req, res) => {
    const { Date, foodname, food_protein, food_carbs, food_fats, food_calories } = req.body;
    console.log(Date, foodname, food_protein, food_carbs, food_fats, food_calories)
    const food = new Foods({
        Date,
        foodname,
        food_protein,
        food_carbs,
        food_fats,
        food_calories,
    });

    try {
        const newFood = await food.save();
        res.status(201).json(newFood);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete("/deleteDataByDate/:date", async (req, res) => {
    const selectedDate = req.params.date;
    try {
        // Remove all foods for the selected date
        await Foods.deleteMany({ Date: selectedDate });
        res.json({ message: "Delete data for the selected date successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete data for the selected date" });
    }
});

module.exports = router;
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
});
module.exports = router;
