async function fetchData() {
    try {
        const param = document.getElementById('paramInput').value;
        console.log('Fetching data with param:', param);  // Journal de débogage
        const response = await fetch(`/data?param=${encodeURIComponent(param)}`);
        const data = await response.json();
        
        document.getElementById('content').innerText = data.message;
        console.log('Data received:', data);  // Journal de débogage

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

        console.log('Graph initialized');  // Journal de débogage

        // Ajout d'un écouteur d'événement contextuel globalement sur le conteneur de Cytoscape
        cy.container().addEventListener('contextmenu', function(evt) {
            evt.preventDefault();
            const rect = cy.container().getBoundingClientRect();
            const x = evt.clientX - rect.left;
            const y = evt.clientY - rect.top;
            const target = cy.elements().filter(ele => ele.isNode() && ele.renderedBoundingBox().x1 <= x && ele.renderedBoundingBox().x2 >= x && ele.renderedBoundingBox().y1 <= y && ele.renderedBoundingBox().y2 >= y)[0];

            if (target) {
                console.log('Right-click on node detected');  // Journal de débogage

                if (document.getElementById('contextMenu')) {
                    document.getElementById('contextMenu').remove();
                }

                const menu = document.createElement('div');
                menu.id = 'contextMenu';
                menu.style.position = 'absolute';
                menu.style.top = `${evt.clientY}px`;
                menu.style.left = `${evt.clientX}px`;
                menu.style.background = 'white';
                menu.style.border = '1px solid #ccc';
                menu.style.padding = '10px';

                const addNodeButton = document.createElement('button');
                addNodeButton.innerText = 'Ajouter 4 nœuds';
                addNodeButton.onclick = async function() {
                    console.log('Add node button clicked');  // Journal de débogage
                    const response = await fetch('/add_nodes', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ source_id: target.id() })
                    });
                    const newNodes = await response.json();
                    console.log('New nodes received:', newNodes);  // Journal de débogage
                    cy.add(newNodes);
                    cy.layout({ name: 'cose' }).run();
                    menu.remove();
                };

                menu.appendChild(addNodeButton);
                document.body.appendChild(menu);
            } else {
                console.log('Right-click not on a node');  // Journal de débogage
            }
        });

        document.addEventListener('click', function(event) {
            const contextMenu = document.getElementById('contextMenu');
            if (contextMenu && !contextMenu.contains(event.target)) {
                contextMenu.remove();
            }
        });

    } catch (error) {
        console.error('Erreur:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Document ready');  // Journal de débogage
    document.getElementById('fetchButton').addEventListener('click', fetchData);
});
