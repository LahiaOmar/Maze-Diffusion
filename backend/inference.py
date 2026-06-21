import numpy as np
import torch
from utils import get_model, get_scheduler, get_path_saved_model, get_torch_device

device = get_torch_device()


def _prepare_inference(model_params, model_id, maze, startAndEnd):
  model_init = model_params['model']
  scheduler_init = model_params['scheduler']

  model = get_model(model=model_init)
  noise_scheduler = get_scheduler(scheduler=scheduler_init)
  model.to(device)

  t_maze = torch.tensor(maze)
  t_startAndEnd = torch.tensor(startAndEnd)
  condition = t_maze + t_startAndEnd
  condition = condition.unsqueeze(0).unsqueeze(0).to(device)

  model_path = get_path_saved_model(model_id)
  model.load_state_dict(torch.load(model_path, weights_only=True, map_location=device))

  x0 = torch.randn_like(condition.float()).to(device)
  model.eval()

  return model, noise_scheduler, condition, x0, np.array(maze)


def _extract_cells(x0, maze_np, step, total):
  heatmap = x0.squeeze().cpu().numpy()
  threshold = 0.5 + 0.4 * (step / total)
  cells = [
    [int(r), int(c)]
    for r, c in np.argwhere(heatmap > threshold)
    if maze_np[r, c] == 1
  ]
  return {"step": step, "total": total, "solution": cells}


def solution_inference_stream(model_params, model_id, maze, startAndEnd, step_interval=25):
  model, noise_scheduler, condition, x0, maze_np = _prepare_inference(
    model_params, model_id, maze, startAndEnd
  )
  total = len(noise_scheduler.timesteps)

  for i, t in enumerate(noise_scheduler.timesteps):
    with torch.no_grad():
      residual = model(x0, t, condition.int())

    x0 = noise_scheduler.step(residual, t, x0).prev_sample

    if (i + 1) % step_interval == 0 or i == total - 1:
      yield _extract_cells(x0, maze_np, i + 1, total)


def solution_inference(model_params, model_id, maze, startAndEnd):
  model, noise_scheduler, condition, x0, _ = _prepare_inference(
    model_params, model_id, maze, startAndEnd
  )

  for t in noise_scheduler.timesteps:
    with torch.no_grad():
      residual = model(x0, t, condition.int())

    x0 = noise_scheduler.step(residual, t, x0).prev_sample

  return x0.squeeze().cpu().numpy()
