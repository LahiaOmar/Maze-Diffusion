import uuid
import base64
import json

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

