"""
Labelled sample complaints used to train the category & priority models.
This is a small, hand-written seed dataset — good enough for a working demo.
As real complaints accumulate in PostgreSQL, retrain on those for accuracy.

Each row: (text, category, priority)
"""

TRAINING_DATA = [
    # ---------------- ROAD ----------------
    ("Big pothole on the main road near the bus stop", "ROAD", "HIGH"),
    ("Road is broken and dangerous for two wheelers", "ROAD", "HIGH"),
    ("Cracks appearing on the newly built road", "ROAD", "LOW"),
    ("Speed breaker damaged causing accidents", "ROAD", "URGENT"),
    ("Uneven road surface near the school", "ROAD", "MEDIUM"),
    ("Manhole cover missing on the street, very dangerous", "ROAD", "URGENT"),
    ("Road under construction blocking traffic for weeks", "ROAD", "MEDIUM"),
    ("Potholes filled with rainwater on highway", "ROAD", "HIGH"),

    # ---------------- WATER ----------------
    ("No water supply in our area since morning", "WATER", "HIGH"),
    ("Water pipeline leaking on the road", "WATER", "MEDIUM"),
    ("Dirty and contaminated water coming from tap", "WATER", "URGENT"),
    ("Low water pressure in the entire ward", "WATER", "MEDIUM"),
    ("Sewage water mixing with drinking water supply", "WATER", "URGENT"),
    ("Water tanker did not arrive as scheduled", "WATER", "LOW"),
    ("Broken water pipe flooding the street", "WATER", "HIGH"),
    ("No water for three days in the colony", "WATER", "URGENT"),

    # ---------------- ELECTRICITY ----------------
    ("Power cut in our locality for several hours", "ELECTRICITY", "HIGH"),
    ("Electric wire hanging dangerously low", "ELECTRICITY", "URGENT"),
    ("Frequent voltage fluctuation damaging appliances", "ELECTRICITY", "MEDIUM"),
    ("Transformer sparking and making loud noise", "ELECTRICITY", "URGENT"),
    ("No electricity in the whole area since night", "ELECTRICITY", "HIGH"),
    ("Electricity bill wrong amount charged", "ELECTRICITY", "LOW"),
    ("Exposed live wire near the children park", "ELECTRICITY", "URGENT"),

    # ---------------- GARBAGE ----------------
    ("Garbage not collected for a week, bad smell", "GARBAGE", "MEDIUM"),
    ("Overflowing dustbin near the market", "GARBAGE", "MEDIUM"),
    ("Dead animal lying on the road for days", "GARBAGE", "HIGH"),
    ("Garbage dumped in open plot attracting flies", "GARBAGE", "MEDIUM"),
    ("Waste collection vehicle not coming regularly", "GARBAGE", "LOW"),
    ("Piles of garbage causing health hazard", "GARBAGE", "HIGH"),
    ("Plastic waste burning creating pollution", "GARBAGE", "HIGH"),

    # ---------------- STREETLIGHT ----------------
    ("Street light not working for many days", "STREETLIGHT", "MEDIUM"),
    ("Dark street at night unsafe for women", "STREETLIGHT", "HIGH"),
    ("Several street lights broken in the lane", "STREETLIGHT", "MEDIUM"),
    ("Street light flickering continuously", "STREETLIGHT", "LOW"),
    ("No lighting near the railway crossing", "STREETLIGHT", "HIGH"),
    ("Pole light fell down after storm", "STREETLIGHT", "URGENT"),

    # ---------------- OTHER ----------------
    ("Stray dogs menace in the neighbourhood", "OTHER", "MEDIUM"),
    ("Illegal encroachment on public footpath", "OTHER", "LOW"),
    ("Mosquito breeding due to stagnant water", "OTHER", "MEDIUM"),
    ("Noise pollution from nearby construction", "OTHER", "LOW"),
    ("Park benches broken and unusable", "OTHER", "LOW"),
    ("Public toilet in very poor condition", "OTHER", "MEDIUM"),
    ("Tree fallen blocking the footpath", "OTHER", "HIGH"),
]
