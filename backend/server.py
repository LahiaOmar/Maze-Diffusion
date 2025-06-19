from flask import Flask, request, jsonify
from inference import solution_inference
from utils import read_json_file
import os
import numpy as np

experiments_file_path = './experiments.json'
models_result_path = './experiments_result.json'

app = Flask(__name__)

@app.route('/api/solve', methods=['POST'])
def solve_maze():
  payload = request.get_json()
  if payload is None:
    return jsonify({ 'error': 'Invalid data'})
  
  maze = payload['maze']
  startAndEnd = payload['startAndEnd']

  model_params = app.config['model_params']
  model_id = app.config['model_id']

  maze_solution = solution_inference(model_params, model_id, maze, startAndEnd)

  #basic classification.
  solution_paths = np.argwhere(maze_solution > 0.9)

  result = {
    'solution': solution_paths.tolist()
  }
    
  return jsonify(result), 200


def load_model_init_parameters():
  params = read_json_file(experiments_file_path)
  models_ids = read_json_file(models_result_path)

  return params, models_ids

if __name__ == '__main__':
  exp_params, models_ids = load_model_init_parameters()
  experiments = exp_params['experiments']

  _id = int(os.environ.get('MODEL_INDEX')) or 0

  params = experiments[_id]

  model_id = models_ids[f'experiment_[{_id+1}]']

  print(f'params {params} model_id {model_id}')
  app.config['model_params'] = params 
  app.config['model_id'] = model_id

  app.run(host='0.0.0.0', port=5000, debug=True)