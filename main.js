const express = require('express');
const Repository = require('./Repository.js');

const app = express();
const repository = new Repository();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));


app.get('/api/items/1', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;    
    const filter = req.query.filter || '';    

    const result = repository.getItems('1',page,limit, filter);

    res.json(result);
});

app.get('/api/items/2', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;    
    const filter = req.query.filter || '';    

    const result = repository.getItems('2',page,limit, filter);

    res.json(result);
});


app.post('/api/items', (req, res) => {
    try {
        const { value } = req.body;
        const result = repository.addItem('1', value);
        res.status(202).json(result);
    } catch (error) {
        res.status(409).json({ error: error.message }); // 409 Conflict если дубликат
    }
});

app.patch('/api/items/move', (req, res) => {
    try {
        const { itemId, targetList, newIndex } = req.body;
        const result = repository.updateItemPosition(itemId, targetList, newIndex);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});