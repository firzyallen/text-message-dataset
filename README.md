
# WhatsApp Web JS Integration with Message Classification

This project integrates WhatsApp Web using `whatsapp-web.js` with a message classification model. The system allows automatic classification of incoming WhatsApp messages into three categories: normal, fraud, and promo. The classification is done using a Python script that utilizes a pre-trained machine learning model.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Notes](#notes)

## Installation

1. **Clone the Repository**
   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```

2. **Install Node.js Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Python Environment**
   Make sure you have Anaconda installed. Create a new environment and install the necessary dependencies:
   ```bash
   conda create -n tf_env python=3.8
   conda activate tf_env
   pip install -r requirements.txt
   ```

4. **Add Your Model and Tokenizer**
   Place your `best_model_bilstm_bayes.h5` and `tokenizer.pickle` files in the same directory as `predict.py`.

## Usage

1. **Run the Node.js Application**
   ```bash
   node main.js
   ```

2. **Scan QR Code**
   After running the application, a QR code will be generated in the terminal. Scan it with your WhatsApp to log in.

## Project Structure

- `main.js`: Node.js script that handles WhatsApp Web client and passes messages to the Python script for classification.
- `predict.py`: Python script that processes and classifies incoming messages.
- `requirements.txt`: List of Python dependencies.

## How It Works

1. **Initialization**
   - The Node.js script (`main.js`) sets up the WhatsApp Web client and handles QR code generation for login.
   - It listens for incoming messages and passes them to the Python script (`predict.py`) for classification.

2. **Message Classification**
   - The Python script loads a pre-trained model and a tokenizer.
   - It preprocesses the incoming message, tokenizes it, and then classifies it into one of the three categories: normal, fraud, or promo.
   - The classification result, along with the confidence level, is returned to the Node.js script.

3. **Output**
   - The classification result is displayed in the terminal.

## Dependencies

### Node.js
- `whatsapp-web.js`
- `qrcode-terminal`

### Python
- `numpy`
- `tensorflow`
- `spacy`
- `pickle`
- Other dependencies specified in `requirements.txt`

## Notes

- Ensure that your Python environment path is correctly set in `main.js` for executing `predict.py`.
- Modify the `confidence_threshold` in `predict.py` as needed to adjust the sensitivity of message classification.
- This project assumes you have basic knowledge of both Node.js and Python, and have the required environments set up correctly.
