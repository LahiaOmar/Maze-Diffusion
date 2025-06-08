import os
import json
import torch
import numpy as np 
import matplotlib.pyplot as plt


from tqdm import tqdm
from torch.optim import Adam
from diffusers import DDPMScheduler
from Models import ClassConditionedUnet
from torch.utils.data import DataLoader
from utils import create_uuid, read_json_file
from torch import nn, randn_like, randint, split, abs, no_grad, save

def load_training_data(path):
	data = []
	list_of_json_files = os.listdir(path)

	for current in list_of_json_files:
		if current.endswith('.json'):
			current_data =read_json_file(os.path.join(path, current))
			data.extend(current_data)
	
	return data

def split_and_formatdata(data):
	dataset = []

	for i in range(len(data)):
		current = data[i]
		maze = current['maze']

		startAndEnd = np.array(current['startAndEnd'])
		solution = np.array(current['solution'])

		condition = maze + startAndEnd

		maze_tensor = np.stack([solution, condition])
		dataset.append(maze_tensor)

	
	total_length = len(dataset)
	train_length = round((total_length / 100) * 90)

	train_loader = DataLoader(dataset[:train_length], batch_size=20)
	test_loader = DataLoader(dataset[train_length:], batch_size=20)

	return (train_loader, test_loader)

def get_validation_score(pred, solution):
				
	return abs(solution - pred).float().mean()

class ExperimentsHandler:
	def __init__(self, config):
		self.experiemts_condig = config
		self.save_models_folder_path = './savedModels'
		self.DEFAULT_CONFIG = {
			"model": {
				"name": "UNet",
				"parameters": {
					"simple_size": 28,
					"embedding_num": 3,
					"embedding_dim":28
				}
			},
			"scheduler": {
				"name": "DDPMs",
				"timesteps": 1000,
				"beta_schedule": "linear"
			},
			"training": {
				"epochs": 1000,
				"dataset_path": "./datasets"
			}
		}

	def start(self):
		self.start_experiments(self.experiemts_condig)
	
	def start_experiments(self, config):
		exp_path = config['experiments_path']

		data = self.load_experiments(exp_path)
		experiments = data['experiments']
		result = {}

		for idx in range(len(experiments)):
			experiment = experiments[idx]
			
			experiment_id = create_uuid()
			result[f'experiment_[{idx + 1}]'] = experiment_id

			self.set_where_to_save(experiment)
			model_instance, scheduler_instance, losses, validation_scores = self.start_experiment(experiment)

			self.save_model(model_instance, scheduler_instance, experiment_id)
			self.save_plot(losses, 'training', experiment_id)
			self.save_plot(validation_scores, 'validation', experiment_id)
			self.save_random_validations()
			# save the result ////

		self.save_result(result)

	def save_result(self, result):
		with open('./experiments_result.json', 'w') as f:
			json.dump(result, f, indent=2)
	
	def start_experiment(self, experiment):
		model = experiment['model']
		scheduler = experiment['scheduler']
		training = experiment['training']

		model_instance = self.get_model(model)
		scheduler_instance = self.get_scheduler(scheduler)
		
		return self.start_training_with(model=model_instance,scheduler=scheduler_instance, training=training)

	def start_training_with(self, model, scheduler, training):
		_config = self.DEFAULT_CONFIG['training']
		dataset_path=training.get('dataset_path', _config.get('dataset_path'))
		data = load_training_data(dataset_path)

		train_dataloader, val_dataloader = split_and_formatdata(data)
		epochs = training['epochs']

		loss_fn = nn.MSELoss()
		device = torch.device('cuda' if torch.cuda.is_available() else 'mps')

		model = model.to(device)

		# Training Block.
		opt = Adam(model.parameters(), lr=1e-3)
		losses = []
		validation_scores = []

		for epoch in tqdm(range(epochs), desc='TRAINING BLOCK.'):
			print(f'epoch {epoch}')
			epoch_losses = []
			for _, x in tqdm(enumerate(train_dataloader), total=len(train_dataloader), desc='loop over dataset'):
				x = x.float().to(device)

				bs_solutions, bs_maze_condition = split(x, 1, dim=1)

				bs_noise = randn_like(bs_maze_condition)

				timesteps = randint(
						0, scheduler.config.num_train_timesteps, (bs_maze_condition.shape[0], )).to(device)
				
				x0 = bs_solutions.int()


				x0 = scheduler.add_noise(
						original_samples=x0.float(), noise=bs_noise, timesteps=timesteps)
				
				pred = model(x0, timesteps, bs_maze_condition.int())
				loss = loss_fn(pred, bs_noise)
				epoch_losses.append(loss.item())

				opt.zero_grad()
				loss.backward()
				opt.step()
			
			losses.append(np.mean(epoch_losses, dtype=np.float64))
		
		# Validation Block.
		for idx, x in tqdm(enumerate(val_dataloader), total=len(val_dataloader), desc='VALIDATION BLOCK'):
			x = x.float().to(device)

			bs_solutions, bs_mezes_conditions = split(x, 1, dim=1)
			
			xn = randn_like(bs_solutions.float()).to(device)

			# Denoisoing step.
			for __, t in enumerate(scheduler.timesteps):
				with no_grad():
					residual = model(xn, t, bs_mezes_conditions.int())
				
				xn = scheduler.step(residual, t, xn).prev_sample

			val_score = get_validation_score(xn, bs_solutions)

			validation_scores.append(val_score.cpu().item())

		return model, scheduler, losses, validation_scores

	def load_experiments(self, path):
		return read_json_file(path)

	def get_save_path_plot(self):
		return f'{self.save_models_folder_path}/plots'

	def get_save_path_unet(self):
		return f'{self.save_models_folder_path}/Unets'

	def get_save_path_schdulers(self):
		return f'{self.save_models_folder_path}/schedulers'

	def save_model(self, model, scheduler, id):
		model_path = f'{self.get_save_path_unet()}/unet-[{id}]'
		scheduler_path = f'{self.get_save_path_schdulers()}/scheduler-[{id}]'

		save(model.state_dict(), model_path)
		scheduler.save_config(scheduler_path)

	def save_plot(self, tosave, title, model_id):
		path = f'{self.get_save_path_plot()}/{title}-[{model_id}].png'

		plt.plot(tosave)
		plt.title(title)
		plt.savefig(path)

		plt.clf()
		plt.close()

	def set_where_to_save(self, experiment_id):
		self.save_paths = {
			"plots": f'{self.get_save_path_unet()}', 
		}
	
	def get_model(self, model):
		_config = self.DEFAULT_CONFIG.get('model')
		_config_parameters = _config.get('parameters')

		name = model.get('name', _config.get('name'))
		parameters = model.get('parameters', _config.get('parameters'))

		match name:
			case 'UNet':
				simple_size = parameters.get('simple_size', _config_parameters.get('simple_size') )
				embedding_num = parameters.get('embedding_num', _config_parameters.get('embedding_num') )
				embedding_dim = parameters.get('embedding_dim', _config_parameters.get('embedding_dim') )
				
				return ClassConditionedUnet(simple_size=simple_size, embedding_size=embedding_dim, embedding_num=embedding_num)
			case _:
				return ValueError(f'Unssported model: {name}')

	def get_scheduler(self,scheduler):
		_config = self.DEFAULT_CONFIG.get('scheduler')

		name = scheduler.get('name', _config.get('name'))
		num_train_timesteps = scheduler.get('timesteps', _config.get('timesteps'))

		beta_schedule = scheduler.get('beta_schedule', _config.get('beta_schedule'))
		
		match name:
			case 'DDPMs':
				return DDPMScheduler(num_train_timesteps, beta_schedule=beta_schedule)
			case _: 
				return None

if __name__ == '__main__' :
	config = {
		"experiments_path" : './experiments.json'
	}

	experimentHandler = ExperimentsHandler(config=config)
	experimentHandler.start()