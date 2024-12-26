from flask import Flask, jsonify, send_from_directory, request

app = Flask(__name__, static_folder='static')

@app.route('/data')
def get_data():
    param = request.args.get('param', 'No parameter provided')
    elements = [
        {'data': {'id': 'a'}},
        {'data': {'id': 'b'}},
        {'data': {'id': 'c'}},
        {'data': {'id': 'd'}},
        {'data': {'id': 'e'}},
        {'data': {'id': 'ab', 'source': 'a', 'target': 'b'}},
        {'data': {'id': 'bc', 'source': 'b', 'target': 'c'}},
        {'data': {'id': 'cd', 'source': 'c', 'target': 'd'}},
        {'data': {'id': 'de', 'source': 'd', 'target': 'e'}},
        {'data': {'id': 'ea', 'source': 'e', 'target': 'a'}}
    ]
    data = {'message': f'Bonjour depuis Flask! Paramètre reçu : {param}', 'elements': elements}
    return jsonify(data)

@app.route('/add_nodes', methods=['POST'])
def add_nodes():
    data = request.get_json()
    source_id = data.get('source_id')
    count = data.get('count', 1)  # Default to 1 if not provided

    new_nodes = []
    new_edges = []

    for i in range(count):
        new_node_id = f'{source_id}{i}'
        new_nodes.append(
            {'data': {'id': new_node_id}}
        )
        new_edges.append(
            {'data': {'id': f'{source_id}_{new_node_id}', 'source': source_id, 'target': new_node_id}}
        )
    return jsonify({'nodes': new_nodes, 'edges' : new_edges})

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True)
