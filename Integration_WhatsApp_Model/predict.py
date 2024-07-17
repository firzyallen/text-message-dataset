import re
import string
import numpy as np
import pickle
import spacy
import os
import sys
import logging
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import load_model
from spacy.lang.id.stop_words import STOP_WORDS

# Suppress TensorFlow warnings and logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
logging.getLogger('tensorflow').setLevel(logging.ERROR)

# Paths to the model and tokenizer
model_path = 'best_model_bilstm_bayes.h5'
tokenizer_path = 'tokenizer.pickle'

# Load the trained model
best_model = load_model(model_path)

# Load the tokenizer
with open(tokenizer_path, 'rb') as handle:
    tokenizer = pickle.load(handle)

# Initialize SpaCy for Indonesian language
nlp = spacy.blank('id')

# Function to preprocess input text
def preprocess_text(kalimat):
    kalimat = kalimat.lower()
    kalimat = re.sub(r'\w*\.*\w{1,}\.*\/\w{1,}', '', kalimat)
    kalimat = re.sub(r'rp\s*\d{1,}\s', '', kalimat)
    kalimat = kalimat.translate(str.maketrans('', '', string.punctuation))
    kalimat = re.sub(r"https?://\S*|www\.\S+", "", kalimat)
    kalimat = re.sub(r'(\d{1,}\.*\d{0,})', '', kalimat)
    kalimat = kalimat.strip()

    STOP_WORDS.update(['yg', 'jg', 'teh', 'mah', 'da', 'atuh', 'jd', 'km', 'ak', 'lg', 'ya', 'ga',
                       'ngga', 'nggak', 'gak', 'tp', 'kalo', 'nya', 'pake', 'liat', 'udh', 'aja',
                       'wkwk', 'wkwkwk', 'wk', 'gt', 'gais', 'blm', 'sih', 'tau', 'tahu', 'gt',
                       'udah', 'utk', 'rb', 'rp', 'dgn', 'ayo', 'isi', 'biar', 'yah', 'dr', 'bawa',
                       'gitu', 'eh', 'pas', 'td', 'sm', 'pengen', 'pgn', 'dpt', 'sd', 'byr', 'min'])
    kalimat = [word for word in kalimat.split() if word not in STOP_WORDS and word.isalpha()]
    kalimat = ' '.join(kalimat)
    return kalimat

# Tokenize and pad the input text
def tokenize_and_pad(text, tokenizer, maxlen=24):
    sequences = tokenizer.texts_to_sequences([text])
    padded = pad_sequences(sequences, maxlen=maxlen)
    return padded

# Make predictions
def predict_user_input(user_input, model, tokenizer):
    try:
        # Preprocess the input text
        preprocessed_text = preprocess_text(user_input)
        
        # Tokenize and pad the input text
        tokenized_text = tokenize_and_pad(preprocessed_text, tokenizer)
        
        # Make predictions
        predictions = model.predict(tokenized_text, verbose=0)
        
        # Get the predicted label and probability
        predicted_label = np.argmax(predictions, axis=1)[0]
        predicted_probability = np.max(predictions) * 100
        
        # Map the predicted label to its corresponding class
        label_dict = {0: 'normal', 1: 'fraud', 2: 'promo'}
        predicted_class = label_dict[predicted_label]
        
        return predicted_class, predicted_probability
    except Exception as e:
        return None, str(e)

# Main function to get input from Node.js
if __name__ == "__main__":
    if len(sys.argv) > 1:
        message = sys.argv[1]
        if message.strip():
            predicted_class, predicted_probability = predict_user_input(message, best_model, tokenizer)
            
            if predicted_class is None:
                print(f"Error: {predicted_probability}")
            else:
                confidence_threshold = 80  # Adjust the threshold as needed
                if predicted_probability < confidence_threshold:
                    print(f"{predicted_class} with {predicted_probability:.2f}% confidence - Flagged for manual review")
                else:
                    print(f"{predicted_class} with {predicted_probability:.2f}% confidence")
        else:
            print("Error: Empty message provided for prediction.")
    else:
        print("Error: No message provided for prediction.")