from flask import Flask, request, jsonify
from utils import read_json_file
import os
import numpy as np
from flask_cors import CORS
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
experiments_file_path = BASE_DIR / "experiments.json"
models_result_path = BASE_DIR / "experiments_result.json"

app = Flask(__name__)
CORS(app)

# ---- fast health endpoints (no torch, no heavy work) ----
@app.route("/", methods=["GET"])
def main():
    return "Hello Form Diffusion world 🌀", 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True}), 200


def load_model_init_parameters():
    params = read_json_file(experiments_file_path)
    models_ids = read_json_file(models_result_path)
    return params, models_ids


def init_config():
    exp_params, models_ids = load_model_init_parameters()
    experiments = exp_params["experiments"]

    _id = int(os.environ.get("MODEL_INDEX", "0"))
    _id = max(0, min(_id, len(experiments) - 1))  # safety clamp

    params = experiments[_id]
    model_id = models_ids[f"experiment_[{_id+1}]"]

    app.config["model_params"] = params
    app.config["model_id"] = model_id


# Run init on import (gunicorn imports the module)
init_config()


@app.route("/api/solve", methods=["POST"])
def solve_maze():
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"error": "Invalid data"}), 400

    maze = payload["maze"]
    startAndEnd = payload["startAndEnd"]

    model_params = app.config["model_params"]
    model_id = app.config["model_id"]

    # Lazy import HERE to avoid slow/oom cold-start blocking proxy checks
    from inference import solution_inference

    maze_solution = solution_inference(model_params, model_id, maze, startAndEnd)

    solution_paths = np.argwhere(maze_solution > 0.9)
    return jsonify({"solution": solution_paths.tolist()}), 200


if __name__ == "__main__":
    # only for local dev
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))