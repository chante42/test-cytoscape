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
                name: 'cose'
            }
        });

        console.log('Graph initialized');

        // Ajouter l'événement contextmenu sur les nœuds
        cy.on('cxttap', 'node', function(evt) {
            // Empêcher l'affichage du menu contextuel standard du navigateur
            evt.preventDefault();

            console.log('Right-click on node detected olivier');
            const node = evt.target;

            // Créer le menu contextuel s'il n'existe pas
            let menu = document.getElementById('contextMenu');
            if (!menu) {
                menu = document.createElement('div');
                menu.id = 'contextMenu';
                document.body.appendChild(menu);
            }
            

            menu.style.top = `${evt.originalEvent.clientY}px`;
            menu.style.left = `${evt.originalEvent.clientX}px`;
            menu.style.display = 'block';

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
                cy.layout({ name: 'cose' }).run();
                menu.style.display = 'none';
            };

            // Effacer le contenu précédent du menu et ajouter le bouton
            menu.innerHTML = '';
            menu.appendChild(addNodeButton);
        });

        // Cacher le menu contextuel lorsqu'on clique en dehors
        document.addEventListener('click', function(event) {
            const contextMenu = document.getElementById('contextMenu');
            if (contextMenu && !contextMenu.contains(event.target)) {
                contextMenu.style.display = 'none';
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
