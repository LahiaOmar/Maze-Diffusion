import uuid
import base64
import json
from diffusers import DDPMScheduler
from Models import ClassConditionedUnet
import os

DEFAULT_CONFIG = {
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

def create_uuid():
	return base64.urlsafe_b64encode(uuid.uuid4().bytes).decode('utf-8').rstrip("=")

def read_json_file(path):
	try:
		with open(path, 'r') as f:
			data = json.load(f)
		return data
	except (FileNotFoundError, json.JSONDecodeError) as e:
		print(f'Error reading {path}: {e}')
		return []


def get_model(model):
	_config = DEFAULT_CONFIG.get('model')
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

def get_scheduler(scheduler):
	_config = DEFAULT_CONFIG.get('scheduler')

	name = scheduler.get('name', _config.get('name'))
	num_train_timesteps = scheduler.get('timesteps', _config.get('timesteps'))

	beta_schedule = scheduler.get('beta_schedule', _config.get('beta_schedule'))
	
	match name:
		case 'DDPMs':
			return DDPMScheduler(num_train_timesteps, beta_schedule=beta_schedule)
		case _: 
			return ValueError(f'Unssported Scheduler: {name}')


def build_model_path(model_id):
	return f'./savedModels/Unets/unet-[{model_id}]'

def get_path_saved_model(model_id):
	path = build_model_path(model_id=model_id)

	exit = os.path.exists(path)

	if exit :
		return path
	
	return './maze_solution_diffusion-50-500'