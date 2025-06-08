# 🌀 Maze-Diffusion

This is an experimental project exploring how **Diffusion Models** can be trained to **solve mazes**.  
The goal is to generate a dataset of maze-solution pairs and use it to train a model capable of predicting solutions from unseen mazes.

---

## 🧩 Project Structure

### ✅ Frontend
A simple web UI to:
- Generate random mazes (as 2D matrices)
- Visualize the maze, start/end points, and solution path
- Download maze/solution pairs as `.png` images

#### TODO:
- [x] Implement React + Tailwind UI
- [x] Export images using `html2canvas`
- [ ] Add a Node.js script to bulk-generate datasets offline

---

### ✅ Backend
Train a diffusion model on the generated maze data.

#### TODO:
- [x] Select an appropriate diffusion architecture (or implement from scratch)
- [x] Define training pipeline (dataset loader, scheduler, loss)
- [x] Evaluate model's ability to generalize to unseen mazes

