import torch
from utils import get_model, get_scheduler, get_path_saved_model, get_torch_device

device = get_torch_device()

def solution_inference(model_params, model_id, maze, startAndEnd):
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

  bs_noise = torch.randn_like(condition.float()).to(device)
  x0 = bs_noise
  
  model.eval()

  for i, t in enumerate(noise_scheduler.timesteps):
      with torch.no_grad():
          residual = model(x0, t, condition.int())

      x0 = noise_scheduler.step(residual, t, x0).prev_sample

  solution_tensor = (x0).squeeze()
  solution_list = solution_tensor.cpu().numpy()

  return solution_list