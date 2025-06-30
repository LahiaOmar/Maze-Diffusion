# 🌀 Maze-Diffusion Backend

This is the backend side of an experimental project exploring how diffusion models can learn to solve mazes. It trains a U-Net-based conditional diffusion model to predict the solution path given a maze layout and start/end positions.

---

## 🧠 Project Objective

Train a conditional diffusion model that learns to solve mazes. The maze is represented as a matrix, with:

* **0** for walls
* **1** for valid paths
* A separate matrix indicating the **start and end points**
* The **solution** is generated through the diffusion process

---

## 📂 Project Structure

| File                      | Description                                  |
| ------------------------- | -------------------------------------------- |
| `lunch_experiments.py`    | Entry point to launch training experiments   |
| `Models.py`               | Defines model architecture (e.g., U-Net)     |
| `utils.py`                | Utilities for data loading, saving, plotting |
| `experiments.json`        | Defines training configurations              |
| `experiments_result.json` | Stores training run results                  |
| `requirements.txt`        | Dependency list                              |

---

## 🚀 Getting Started

### 1. Setup Environment

```bash
conda create -n maze-diffusion python=3.10
conda activate maze-diffusion
pip install -r requirements.txt
```

---

## 🧱 Prepare Dataset

You can generate maze datasets directly from the **frontend interface**.

### 🔗 Web Tool

Visit: [`/dataset`](https://maze-diffusion.netlify.app/dataset)

This tool allows you to:

* Select the **maze size** (e.g. 20×20)
* Set how many mazes to generate
* Download the result as `.json`


Once downloaded, place the `.json` dataset file into the `./datasets` directory.

---

## 📈 Running an Experiment

```bash
python lunch_experiments.py
```

This will:

* Load configurations from `experiments.json`
* Train a U-Net model using DDPM
* Save results in `experiments_result.json`
* Output model plots in `./models/plots/`

---

## ⚙️ Configuration Overview

Example from `experiments.json`:

```json
{
  "model": {
    "name": "UNet",
    "parameters": {
      "simple_size": 28,
      "embedding_num": 3,
      "embedding_dim": 784
    }
  },
  "scheduler": {
    "name": "DDPMs",
    "timesteps": 500,
    "beta_schedule": "linear"
  },
  "training": {
    "epochs": 200,
    "dataset_path": "./datasets"
  },
  "use_validation": false
}
```

---

## 📦 Dependencies

All required packages are listed in `requirements.txt`. Major ones include:

* `torch`
* `diffusers`
* `Flask`, `gunicorn` (for backend API serving)
* `numpy`, `matplotlib`, `tqdm`

Install them via:

```bash
pip install -r requirements.txt
```
