async function fetchData() {
    try {
        const param = document.getElementById('paramInput').value;
        const response = await fetch(`/data?param=${encodeURIComponent(param)}`);
        const data = await response.json();
        
        document.getElementById('content').innerText = data.message;

        // Création du graphe réseau avec Cytoscape
        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: data.elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#0074D9',
                        'label': 'data(id)',
                        'color': '#fff',
                        'text-valign': 'center',
                        'text-halign': 'center'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#0074D9',
                        'target-arrow-color': '#0074D9',
                        'target-arrow-shape': 'triangle'
                    }
                }
            ],
            layout: {
                name: 'cose'
            }
        });

    } catch (error) {
        console.error('Erreur:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fetchButton').addEventListener('click', fetchData);
});
