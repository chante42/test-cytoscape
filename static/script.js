let highlightedNode = null;

async function fetchData() {
    try {
        const param = document.getElementById('paramInput').value;
        console.log('Fetching data with param:', param);
        const response = await fetch(`/data?param=${encodeURIComponent(param)}`);
        const data = await response.json();
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

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);

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

        // Afficher le tooltip et changer la couleur au survol d'un nœud
        cy.on('mouseover', 'node', function(evt) {
            const node = evt.target;
            node.addClass('node-hover');

            tooltip.innerText = `Node ID: ${node.id()}`;
            tooltip.style.display = 'block';
            tooltip.style.top = `${evt.renderedPosition.y}px`;
            tooltip.style.left = `${evt.renderedPosition.x}px`;
        });

        // Réinitialiser la couleur et cacher le tooltip lors du retrait du survol d'un nœud
        cy.on('mouseout', 'node', function(evt) {
            const node = evt.target;
            node.removeClass('node-hover');
            tooltip.style.display = 'none';
        });

        // Afficher le tooltip et changer la couleur au survol d'une arête
        cy.on('mouseover', 'edge', function(evt) {
            const edge = evt.target;
            edge.addClass('edge-hover');

            tooltip.innerText = `Edge: ${edge.id()}`;
            tooltip.style.display = 'block';
            tooltip.style.top = `${evt.renderedPosition.y}px`;
            tooltip.style.left = `${evt.renderedPosition.x}px`;
        });

        // Réinitialiser la couleur et cacher le tooltip lors du retrait du survol d'une arête
        cy.on('mouseout', 'edge', function(evt) {
            const edge = evt.target;
            edge.removeClass('edge-hover');
            tooltip.style.display = 'none';
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
