"""
Train the category and priority classifiers, then save them to models/.
Run:  python train.py
"""

import os

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from data.training_data import TRAINING_DATA

MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)


def build_pipeline():
    # TF-IDF turns text into numeric features; Logistic Regression classifies.
    return Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    lowercase=True,
                    stop_words="english",
                    ngram_range=(1, 2),
                    min_df=1,
                ),
            ),
            ("clf", LogisticRegression(max_iter=1000)),
        ]
    )


def main():
    texts = [row[0] for row in TRAINING_DATA]
    categories = [row[1] for row in TRAINING_DATA]
    priorities = [row[2] for row in TRAINING_DATA]

    print(f"Training on {len(texts)} labelled complaints...")

    category_model = build_pipeline()
    category_model.fit(texts, categories)
    joblib.dump(category_model, os.path.join(MODELS_DIR, "category_model.joblib"))
    print("  saved category_model.joblib")

    priority_model = build_pipeline()
    priority_model.fit(texts, priorities)
    joblib.dump(priority_model, os.path.join(MODELS_DIR, "priority_model.joblib"))
    print("  saved priority_model.joblib")

    # quick sanity check
    sample = "There is a huge pothole and the road is completely broken"
    print("\nSanity check:")
    print("  text:", sample)
    print("  category ->", category_model.predict([sample])[0])
    print("  priority ->", priority_model.predict([sample])[0])
    print("\nDone. Models are in ./models/")


if __name__ == "__main__":
    main()
