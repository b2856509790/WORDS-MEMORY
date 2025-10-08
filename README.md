# Multi-Language Word Memory System

A fully-featured multi-language word memorization website that supports multiple language learning, data import/export, and various memorization modes.

## Features

### 📚 Word Management

- Add, edit, and delete words
- Support for multiple languages (English, Japanese, Korean, French, German, Spanish, Italian, Russian, Arabic, etc.)
- Difficulty levels (Easy, Medium, Hard)
- Example sentences and notes support
- Real-time search and filtering

### 📥 Data Import/Export

- Import support for JSON, CSV, TXT formats
- One-click export of all data
- Sample data files provided

### 🎯 Multiple Memorization Modes

- **Flashcard Mode**: Flip cards to learn
- **Test Mode**: Multiple choice testing
- **Typing Practice**: Input practice mode

### 💾 Data Persistence

- Local storage, data won't be lost
- Automatic save of learning progress

## How to Use

### 1. Open the Website

Simply open the `index.html` file in your browser to start using.

### 2. Add Words

1. Fill in word information in the form on the right
2. Select language and difficulty
3. Optionally fill in example sentences and notes
4. Click "Save Word"

### 3. Import Data

1. Click the "Import Data" button
2. Select supported file format (JSON, CSV, TXT)
3. The system will automatically parse and import words

#### Supported File Formats

**JSON Format**:

```json
[
  {
    "word": "hello",
    "translation": "你好",
    "language": "英语",
    "difficulty": "easy",
    "example": "Hello, how are you?",
    "notes": "最常用的问候语"
  }
]
```

**CSV Format**:

```csv
word,translation,language,difficulty,example,notes
hello,你好,英语,easy,"Hello, how are you?",最常用的问候语
```

**TXT Format** (separated by |):

```
hello|你好|英语|easy|Hello, how are you?|最常用的问候语
```

### 4. Learning Modes

#### Flashcard Mode

- Click "Flashcard Mode" to start
- Click "Flip" to see the answer
- Click "Next" to continue learning

#### Test Mode

- Click "Test Mode" to start
- Select the correct answer
- The system will show accuracy rate

#### Typing Practice

- Click "Typing Practice" to start
- Type the answer based on the prompt
- Press Enter or click "Check" to submit answer

### 5. Search and Filter

- Use the search box to quickly find words
- Filter by language
- Filter by difficulty

## Sample Data

The project includes three sample data files:

- `sample_words.json` - JSON format example
- `sample_words.csv` - CSV format example
- `sample_words.txt` - TXT format example

You can directly import these files to test the system functionality.

## Technical Features

- **Pure Frontend Implementation**: No server required, runs directly in browser
- **Responsive Design**: Supports mobile, tablet, desktop and other devices
- **Modern UI**: Beautiful gradient background and card-based design
- **Data Security**: All data stored locally, privacy secure

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Changelog

### v1.0.0

- Initial version release
- Multi-language word management support
- Three learning modes implemented
- Data import/export support
- Responsive design

## License

MIT License - Free to use and modify

## Contributing

Welcome to submit Issues and Pull Requests to improve this project!

---

**Start your multi-language learning journey!** 🌍📚
