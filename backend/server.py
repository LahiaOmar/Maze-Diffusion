from utils import read_json_file
from flask import Flask, request, jsonify
from inference import solution_inference
# import matplotlib
# matplotlib.use('Agg') 
# import matplotlib.pyplot as plt

model_params_json_path = './model_touse_params.json'

app = Flask(__name__)

@app.route('/api/solve', methods=['POST'])
def solve_maze():
  payload = request.get_json()
  if payload is None:
    return jsonify({ 'error': 'Invalid data'})
  maze = payload['maze']
  startAndEnd = payload['startAndEnd']

  model_params = app.config['model_init_params']
  maze_solution = solution_inference(model_params, maze, startAndEnd)

  result = {
    'solution': maze_solution
  }

  return jsonify(result), 200


def load_model_init_parameters():
  params = read_json_file(model_params_json_path)

  return params

if __name__ == '__main__':
  model_params = load_model_init_parameters()
  app.config['model_init_params'] = model_params

  app.run(host='0.0.0.0', port=5000, debug=True)