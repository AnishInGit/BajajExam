const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3500;

app.use(bodyParser.json({ limit: '10mb' }));

const cors = require('cors');
app.use(cors());

// Create uploads directory if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Utility function to get the highest lowercase alphabet
function getHighestLowercaseAlphabet(data) {
  const lowercaseLetters = data.filter((char) => /[a-z]/.test(char));
  if (lowercaseLetters.length > 0) {
    return [lowercaseLetters.sort().reverse()[0]];
  }
  return [];
}

// Validate file from Base64
function handleFile(fileBase64) {
  if (!fileBase64) {
    console.log('No file provided');
    return { file_valid: false };
  }

  try {
    // Extract MIME type and Base64 data using regex
    const matches = fileBase64.match(/^data:(.+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      console.log('Invalid file format');
      return { file_valid: false };
    }

    const mimeType = matches[1]; 
    const fileData = matches[2]; 

    // Convert Base64 to binary and save to file
    const filePath = path.join(uploadDir, `upload.${mimeType.split('/')[1]}`);
    fs.writeFileSync(filePath, Buffer.from(fileData, 'base64'));

    // Get the file size in KB
    const fileSizeInKB = fs.statSync(filePath).size / 1024;

    return {
      file_valid: true,
      file_mime_type: mimeType,
      file_size_kb: fileSizeInKB.toFixed(2),
    };
  } catch (error) {
    console.log('Error handling file:', error.message);
    return { file_valid: false };
  }
}

// POST route for /bfhl
app.post('/bfhl', (req, res) => {
  const { data, file_b64 } = req.body;

  // Validate 'data' input
  if (!Array.isArray(data)) {
    return res.status(400).json({
      is_success: false,
      message: 'Invalid input format. "data" should be an array.',
    });
  }

  const numbers = data.filter((item) => !isNaN(item));
  const alphabets = data.filter((item) => isNaN(item));
  const highestLowercaseAlphabet = getHighestLowercaseAlphabet(alphabets);

  const fileInfo = handleFile(file_b64);

  res.json({
    is_success: true,
    user_id: 'Anish_Maity_RA2111003030266',
    email: 'am4049@srmist.edu.in',
    roll_number: 'RA2111003030266',
    numbers: numbers,
    alphabets: alphabets,
    highest_lowercase_alphabet: highestLowercaseAlphabet,
    ...fileInfo,
  });
});

// GET route for /bfhl
app.get('/bfhl', (req, res) => {
  res.status(200).json({
    operation_code: 1,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    is_success: false,
    message: 'Internal Server Error',
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
