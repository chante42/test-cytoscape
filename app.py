from flask import Flask, jsonify, send_from_directory, request

app = Flask(__name__, static_folder='static')

@app.route('/data')
def get_data():
    param = request.args.get('param', 'No parameter provided')
    # Exemple de données de graphe
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

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True)
