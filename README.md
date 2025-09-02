# EduPerform - Student Performance Prediction

This is a student performance prediction platform built with Next.js and Firebase Studio. It uses AI to provide insights into student performance.

## Running the Project Locally

To run this project on your local machine, you will need Node.js and Git installed.

### 1. Clone the Repository
Clone your GitHub repository to your local machine:
```bash
git clone <your-github-repo-url>
cd <your-project-folder-name>
```

### 2. Install Dependencies
Install all the necessary packages for the project:
```bash
npm install
```

### 3. Set Up Environment Variables
This project uses the Gemini API for its AI features. You need to provide an API key.

- Create a file named `.env.local` in the root of the project.
- Add your Gemini API key to this file:
  ```
  GEMINI_API_KEY=<your-gemini-api-key>
  ```
You can get a Gemini API key from Google AI Studio.


### 4. Run the Development Servers
This project requires two servers running simultaneously in two separate terminals.

**Terminal 1: Start the Next.js App**
This command starts the main web application.
```bash
npm run dev
```
Your application will be available at `http://localhost:9002`.

**Terminal 2: Start the Genkit AI Service**
This command starts the backend AI service that powers features like the Calculator and Summarizer.
```bash
npm run genkit:watch
```

You must have both servers running for all features of the application to work correctly.
