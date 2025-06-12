import torch
from diffusers import DDPMScheduler
from Models import ClassConditionedUnet

device = 'mps'

def get_model_and_schedule(embedding_num, embedding_size):
  model = ClassConditionedUnet(embedding_num, embedding_size).to(device)
  noise_scheduler = DDPMScheduler(num_train_timesteps=500)
  
  return model, noise_scheduler

def solution_inference(model_params, maze, startAndEnd):
  embedding_num = model_params['embedding_num']
  embedding_size = model_params['embedding_size']

  model, noise_scheduler = get_model_and_schedule(embedding_num, embedding_size)

  t_maze = torch.tensor(maze)
  t_startAndEnd = torch.tensor(startAndEnd)


  condition = t_maze + t_startAndEnd
  condition = condition.unsqueeze(0).unsqueeze(0).to('mps')
  print(condition.shape)

  model.load_state_dict(torch.load('./maze_solution_diffusion-50-500', weights_only=True))

  bs_noise = torch.randn_like(condition.float()).to('mps')
  x0 = bs_noise
  
  model.eval()

  for i, t in enumerate(noise_scheduler.timesteps):
      with torch.no_grad():
          residual = model(x0, t, condition.int())

      x0 = noise_scheduler.step(residual, t, x0).prev_sample

  solution_tensor = (x0).squeeze()
  solution_list = solution_tensor.cpu().tolist()

  return solution_list