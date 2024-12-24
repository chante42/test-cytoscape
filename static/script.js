let highlightedNode = null;

async function fetchData() {
    try {
        const param = document.getElementById('paramInput').value;
        console.log('Fetching data with param:', param);
        const response = await fetch(`/data?param=${encodeURIComponent(param)}`);
        const data = await response.json();
        
        document.getElementById('content').innerText = data.message;
        console.log('Data received:', data);

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
                name: 'cose' // Utilisation de 'cose' pour initialement bien positionner le graphe
            }
        });

        console.log('Graph initialized');

        // Ajouter l'événement contextmenu sur les nœuds
        cy.on('cxttap', 'node', function(evt) {
            console.log('Right-click on node detected');
            const node = evt.target;

            // Remove highlight from the previously highlighted node
            if (highlightedNode) {
                highlightedNode.style('background-color', '#0074D9');
            }

            // Highlight the clicked node
            node.style('background-color', '#FF4136');
            highlightedNode = node;

            // Créer le menu contextuel s'il n'existe pas
            let menu = document.getElementById('contextMenu');
            if (!menu) {
                menu = document.createElement('div');
                menu.id = 'contextMenu';
                document.body.appendChild(menu);
            }

            // Empêcher l'affichage du menu contextuel standard du navigateur
            evt.preventDefault();

            menu.style.top = `${evt.originalEvent.clientY}px`;
            menu.style.left = `${evt.originalEvent.clientX}px`;
            menu.classList.add('show');

            // Ajouter un bouton au menu
            const addNodeButton = document.createElement('button');
            addNodeButton.innerText = 'Ajouter 4 nœuds';
            addNodeButton.onclick = async function() {
                const response = await fetch('/add_nodes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ source_id: node.id() })
                });
                const newNodes = await response.json();
                cy.add(newNodes);

                // Distribuer les nouveaux nœuds autour du nœud cliqué sur la circonférence d'un cercle
                const radius = 100; // Rayon du cercle
                const angleStep = (2 * Math.PI) / newNodes.length;
                newNodes.forEach((element, index) => {
                    if (element.data) {
                        const angle = index * angleStep;
                        cy.getElementById(element.data.id).position({
                            x: node.position('x') + radius * Math.cos(angle),
                            y: node.position('y') + radius * Math.sin(angle)
                        });
                    }
                });

                menu.classList.remove('show');
            };

            // Effacer le contenu précédent du menu et ajouter le bouton
            menu.innerHTML = '';
            menu.appendChild(addNodeButton);
        });

        // Cacher le menu contextuel lorsqu'on clique en dehors
        document.addEventListener('click', function(event) {
            const contextMenu = document.getElementById('contextMenu');
            if (contextMenu && !contextMenu.contains(event.target)) {
                contextMenu.classList.remove('show');
            }
        });

        // Recalculer la position de tous les nœuds
        document.getElementById('recalculateButton').addEventListener('click', function() {
            cy.layout({
                name: 'cose'
            }).run();

            // Maintenir la couleur du dernier nœud sélectionné
            if (highlightedNode) {
                highlightedNode.style('background-color', '#FF4136');
            }
        });

    } catch (error) {
        console.error('Erreur:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Document ready');
    document.getElementById('fetchButton').addEventListener('click', fetchData);
});
