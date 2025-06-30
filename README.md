# Maze-Diffusion

An experimental project for training conditional diffusion models that can solve 2‑D mazes. The project represents mazes as **three‑channel numpy** (walls, start/end points, and solution path) and trains a class‑conditioned U‑Net to denoise a corrupted solution path conditioned on the maze layout.

---

## 🔧 Installation

```bash
# 1. Clone the repo
 git clone https://github.com/your‑handle/maze‑diffusion.git
 cd maze‑diffusion && cd backend

# 2. Create & activate a virtualenv (optional but recommended)
  conda create --name maze-diffusion 
  conda activate maze-diffusion

# 3. Install core dependencies
 pip install -r requirements.txt
```

---

## 🗃 Dataset format

Each maze is stored as a **3‑channel** NumPy array of shape `(H, W, 3)`:

| Channel | Values                                | Meaning                |
| ------- | ------------------------------------- | ---------------------- |
|  0      | `0` = pathable, `1` = wall            | Maze walls             |
|  1      | `1` = start, `1` = end, `0` elsewhere | End‑points             |
|  2      | `1` on solution cells, `0` elsewhere  | Solution path (target) |


---

## 🧠 How does training work?

During training, the model learns to reconstruct the correct maze solution path from a noisy version of it, conditioned on the maze layout.

1. **Maze Encoding:** Each maze is a 3-channel image:

   * Channel 0: maze walls (binary)
   * Channel 1: start and end points (as classes)
   * Channel 2: ground truth solution path

2. **Input Preparation:**

   * The solution path (channel 2) is corrupted with Gaussian noise.
   * Channels 0 and 1 are used as conditioning information.

3. **Model Structure:**

   * A class-conditioned U-Net receives the noisy solution path + conditioning channels.
   * The U-Net predicts a denoised version of the solution path.

4. **Training Loop:**

   * Loss is computed between the predicted and original (clean) solution path.
   * A scheduler (e.g., DDPM, DDIM) controls the noise schedule.

5. **Output:**

   * Model checkpoints are saved after every few epochs.
   * Periodic samples are generated to monitor learning.

---

## 🤝 Contributing

1. Fork the repo & create a feature branch.
2. Submit a PR describing your change.

Bug reports & feature requests are welcome via GitHub issues.

---

## 📜 License

This project is licensed under the **MIT License** – see `LICENSE` for details.

