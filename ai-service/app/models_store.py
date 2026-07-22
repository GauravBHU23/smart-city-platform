import os

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

MODELS_DIR = "models"

_category_model = None
_priority_model = None


def _load():
    global _category_model, _priority_model
    if _category_model is None:
        path = os.path.join(MODELS_DIR, "category_model.joblib")
        if not os.path.exists(path):
            raise RuntimeError("Models not trained. Run `python train.py` first.")
        _category_model = joblib.load(path)
        _priority_model = joblib.load(
            os.path.join(MODELS_DIR, "priority_model.joblib")
        )
    return _category_model, _priority_model


def _top_prediction(model, text):
    """Return (label, confidence 0..1) for the predicted class."""
    label = model.predict([text])[0]
    proba = model.predict_proba([text])[0]
    confidence = float(max(proba))
    return label, round(confidence, 3)


def classify_category(text: str):
    category_model, _ = _load()
    label, conf = _top_prediction(category_model, text)
    return {"category": label, "confidence": conf}


def predict_priority(text: str):
    _, priority_model = _load()
    label, conf = _top_prediction(priority_model, text)
    return {"priority": label, "confidence": conf}


def find_duplicates(text: str, existing: list[dict], threshold: float = 0.35):
    """
    Compare `text` against a list of existing complaints (each {id, text})
    using TF-IDF cosine similarity. Returns matches above the threshold.
    """
    if not existing:
        return {"is_duplicate": False, "matches": []}

    corpus = [text] + [e["text"] for e in existing]
    vectorizer = TfidfVectorizer(lowercase=True, stop_words="english")
    matrix = vectorizer.fit_transform(corpus)

    # similarity of the new text (row 0) against every existing one
    sims = cosine_similarity(matrix[0:1], matrix[1:])[0]

    matches = []
    for e, score in zip(existing, sims):
        if score >= threshold:
            matches.append({"id": e["id"], "similarity": round(float(score), 3)})

    matches.sort(key=lambda m: m["similarity"], reverse=True)
    return {"is_duplicate": len(matches) > 0, "matches": matches}
