const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// 從 .env 取得設定值
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'taiwandb'; // 直接指定資料庫名稱
const PORT = process.env.PORT || 3000;

// MongoDB 連接
mongoose.connect(`${MONGO_URI}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'taiwandb' // 明確指定資料庫名稱
})
.then(() => {
  console.log('成功連接到 MongoDB taiwandb');
})
.catch((err) => console.error('MongoDB 連接錯誤:', err));

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// 定義 items collection 的 Schema
const itemSchema = new mongoose.Schema({
  item: String,
  correct: String,
  wrong: [String],
  category: String
}, { 
  collection: 'items' // 明確指定 collection 名稱為 items
}); 

const Item = mongoose.model('Item', itemSchema);

// API 路由：獲取所有題目
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    console.error('獲取題目時發生錯誤:', error);
    res.status(500).json({ error: '無法獲取題目' });
  }
});

// 遊戲首頁
app.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    console.log(`已從 items collection 載入 ${items.length} 個問題`);
    res.render('index', { questions: items });
  } catch (error) {
    console.error('讀取題目時發生錯誤:', error);
    res.render('index', { questions: [] });
  }
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('應用程式錯誤:', err);
  res.status(500).send('伺服器發生錯誤');
});

app.listen(PORT, () => {
  console.log(`伺服器運行於 http://localhost:${PORT}`);
  console.log('資料庫: taiwandb, Collection: items');
});
