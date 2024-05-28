// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors()); // Enable CORS
app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = path.join(__dirname, req.file.path);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read file' });
        }
        
        const inputData = JSON.parse(data);
        const formattedData = formatJson(inputData);
        
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Failed to delete file', err);
            }
        });
        
        res.json(formattedData);
    });
});

function formatJson(data) {
    const result = {};
    for (const modeId in data.modes) {
        const modeKey = data.modes[modeId];
        result[modeKey] = {};

        data.variables.forEach(variable => {
            const key = variable.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
            result[modeKey][key] = variable.valuesByMode[modeId];
        });
    }
    return result;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
