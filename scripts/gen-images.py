#!/usr/bin/env python3
"""Generate store imagery with OpenAI gpt-image-2.

Reads OPENAI_API_KEY from .env.local. Writes PNGs into public/images/.
Safe to re-run: skips files that already exist unless --force.
"""
import base64
import json
import os
import ssl
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

# macOS python.org builds often lack root certs; prefer certifi, else fall back
# to an unverified context (this is a local dev asset-gen script only).
try:
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    SSL_CTX = ssl._create_unverified_context()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_key():
    env = os.path.join(ROOT, ".env.local")
    if os.path.exists(env):
        for line in open(env):
            line = line.strip()
            if line.startswith("OPENAI_API_KEY="):
                return line.split("=", 1)[1].strip()
    return os.environ.get("OPENAI_API_KEY", "")


KEY = load_key()
MODEL = "gpt-image-2"

# Shared art direction so the set feels cohesive.
DIRECTION = (
    "Premium e-commerce product photography for a FIFA World Cup 2026 "
    "(USA/Canada/Mexico) print-on-demand apparel brand. Clean studio lighting, "
    "soft shadows, neutral seamless background, ultra sharp, high detail, "
    "modern athletic streetwear aesthetic. No text watermarks."
)

JOBS = [
    # filename, size, prompt
    ("brand/hero.png", "1536x1024",
     "Wide cinematic hero image: a packed modern soccer stadium at night under "
     "bright floodlights, confetti and golden sparks in the air, dramatic atmosphere, "
     "deep teal-to-black gradient sky, electric green and gold light accents, "
     "premium and elegant, motion energy, shallow depth of field. No text. "
     "Editorial sports campaign look."),
    ("brand/grid-texture.png", "1024x1024",
     "Abstract dark sports texture background, subtle hexagonal soccer-ball pattern, "
     "deep charcoal and ink with faint emerald-green glow, premium minimal, very low "
     "contrast, seamless. No text."),
    ("products/tee-white.png", "1024x1024",
     DIRECTION + " A white premium cotton t-shirt, front view flat lay, ghost mannequin, "
     "featuring a bold minimal 'WORLD CUP 2026' badge graphic with a gold trophy emblem in the center."),
    ("products/jersey-home.png", "1024x1024",
     DIRECTION + " A modern soccer jersey in deep emerald green with gold trim and a subtle "
     "stars pattern, front view on ghost mannequin, athletic fit, breathable fabric texture."),
    ("products/hoodie-black.png", "1024x1024",
     DIRECTION + " A black premium heavyweight hoodie, front view ghost mannequin, with a small "
     "embroidered gold soccer-ball crest on the chest and 'USA 26' clean text on the sleeve."),
    ("products/cap.png", "1024x1024",
     DIRECTION + " A structured dad cap in cream color with an embroidered gold trophy emblem, "
     "three-quarter front view, studio product shot."),
    ("products/mug.png", "1024x1024",
     DIRECTION + " A glossy white ceramic mug with a wrap-around emerald and gold World Cup 2026 "
     "design, studio shot on neutral surface, soft reflection."),
    ("products/poster.png", "1024x1024",
     "A framed art poster mockup on a light gallery wall, the poster shows a bold geometric "
     "World Cup 2026 USA celebration design in emerald, gold and ink, modern editorial style, "
     "product photography, soft shadow."),
    ("products/tote.png", "1024x1024",
     DIRECTION + " A natural canvas tote bag hanging, with a screen-printed minimalist soccer ball "
     "and 'WORLD CUP 2026' line graphic in dark ink, studio product shot."),
    ("products/scarf.png", "1024x1024",
     DIRECTION + " A knitted football supporter scarf in emerald green, gold and white stripes with "
     "'2026' woven text, laid flat in a neat fold, studio product shot."),
    ("products/longsleeve.png", "1024x1024",
     DIRECTION + " A cream long-sleeve shirt, front view ghost mannequin, with a vertical gold and "
     "emerald World Cup 2026 sleeve print and small chest crest."),
    ("products/beanie.png", "1024x1024",
     DIRECTION + " A folded knit beanie in deep ink navy with a gold embroidered trophy patch, "
     "studio product shot on neutral background."),
]


def gen(job):
    name, size, prompt = job
    out = os.path.join(ROOT, "public", "images", name)
    if os.path.exists(out) and "--force" not in sys.argv:
        return f"skip {name}"
    os.makedirs(os.path.dirname(out), exist_ok=True)
    body = json.dumps({
        "model": MODEL, "prompt": prompt, "size": size,
        "quality": "high", "n": 1,
    }).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations", data=body,
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=300, context=SSL_CTX) as r:
            data = json.load(r)
        b64 = data["data"][0]["b64_json"]
        open(out, "wb").write(base64.b64decode(b64))
        return f"OK   {name}"
    except urllib.error.HTTPError as e:
        return f"FAIL {name}: {e.code} {e.read().decode()[:200]}"
    except Exception as e:
        return f"FAIL {name}: {e}"


if __name__ == "__main__":
    if not KEY:
        print("No OPENAI_API_KEY found")
        sys.exit(1)
    print(f"Generating {len(JOBS)} images with {MODEL}...")
    with ThreadPoolExecutor(max_workers=4) as ex:
        for res in ex.map(gen, JOBS):
            print(res, flush=True)
    print("done")
