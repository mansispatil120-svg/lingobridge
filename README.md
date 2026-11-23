
# LingoBridge – Break Language Barriers 🌍

LingoBridge is an AI-powered language translation website designed to help people communicate across different languages.

It provides text translation, voice input, speech playback, translation history, favorites, and a responsive interface.

## 🚀 Features

- Translate text between supported languages.
- Automatic source-language detection.
- Voice input using Web Speech API.
- Listen to translated text using speech synthesis.
- Copy translated text.
- Swap source and target languages.
- Translation history.
- Save favorite translations.
- Dark and light themes.
- Responsive design for mobile and desktop.
- Character counter.
- Secure backend API integration.

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Web Speech API
- LocalStorage

### Backend
- Node.js
- Express.js
- LibreTranslate API
- Helmet
- Express Rate Limit
- Dotenv

## 📁 Project Structure

```text
lingobridge/
│
├── index.html
├── style.css
├── script.js
├── README.md
│
├── assets/
│   ├── images/
│   └── icons/
│
└── backend/
    ├── server.js
    ├── package.json
    ├── .env.example
    └── .env
```

## 💻 Requirements

Install these before running the project:

1. Visual Studio Code
2. Node.js version 18 or above
3. Google Chrome or Microsoft Edge
4. Internet connection
5. LibreTranslate API access

## ⚙️ Installation Guide

### Step 1: Open the project

Open the `lingobridge` folder in Visual Studio Code.

### Step 2: Open the terminal

In VS Code, select:

Terminal → New Terminal

### Step 3: Install backend dependencies

Run:

```bash
cd backend
npm install
```

### Step 4: Configure environment variables

Inside the backend folder, copy `.env.example` and rename the copy to `.env`.

Your backend folder should contain:

```text
backend/
├── server.js
├── package.json
├── .env.example
└── .env
```

Open `.env` and configure:

```env
PORT=3000
NODE_ENV=development
LIBRETRANSLATE_URL=https://libretranslate.com
LIBRETRANSLATE_API_KEY=
```

Add a valid API key if your chosen LibreTranslate service requires one.

Do not upload your `.env` file to GitHub.

### Step 5: Start the backend

Make sure your terminal is inside the `backend` folder.

Run:

```bash
npm start
```

You should see:

```text
LingoBridge Server Started
Website: http://localhost:3000
API Health: http://localhost:3000/api/health
```

### Step 6: Open the website

Open your browser and visit:

http://localhost:3000

Do not open `index.html` directly when testing translation. Run the backend and use the localhost address.

## 🧪 Testing

### Test 1: Text translation

1. Enter text in the source text box.
2. Select the source language.
3. Select the target language.
4. Click Translate.
5. Check the translated result.

### Test 2: Language swapping

1. Select two languages.
2. Click the swap button.
3. Check whether the languages exchange positions.

### Test 3: Copy translation

1. Translate a sentence.
2. Click Copy.
3. Paste it into another application.

### Test 4: Voice input

1. Allow microphone permission.
2. Select the voice input language.
3. Click Start Recording.
4. Speak a sentence.
5. Stop recording and test translation.

Voice recognition depends on browser support and may require an internet connection.

### Test 5: Translation history

1. Translate some sentences.
2. Open the History section.
3. Check whether previous translations appear.

### Test 6: Favorites

1. Translate a sentence.
2. Click the favorite button.
3. Open Favorites.
4. Check whether the translation is saved.

### Test 7: Theme

Switch between light and dark themes and refresh the page to check whether your preference is saved.

## 🔧 Troubleshooting

### Problem: Website does not open

Check that your backend server is running.

### Problem: Translation is not working

- Check your internet connection.
- Check the LibreTranslate URL.
- Check whether an API key is required.
- Check the terminal for backend errors.

### Problem: Microphone is not working

- Use Chrome or Edge.
- Allow microphone permission.
- Check your microphone connection.
- Check browser support for SpeechRecognition.

### Problem: npm command is not recognized

Install Node.js and restart VS Code.

## 🔐 Security Notes

- Keep API keys inside the backend `.env` file.
- Never put private API keys in frontend JavaScript.
- Do not upload `.env` to public repositories.
- Use HTTPS and appropriate security settings when deploying.

## 🌐 Future Improvements

- User registration and login.
- Database integration.
- More Indian and international languages.
- Document translation.
- Translation using AI language models.
- Translation history synchronization.
- Mobile application.
- Text-to-speech voice selection.

## 👩‍💻 Project

**Project Name:** LingoBridge – Break Language Barriers

**Category:** AI-Powered Web Application

**Purpose:** To make multilingual communication easier and more accessible.

---

Made with ❤️ using HTML, CSS, JavaScript and Node.js.
