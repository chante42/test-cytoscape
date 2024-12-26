let highlightedNode = null;
let cy; // Définir cy comme une variable globale

async function fetchData() {
    try {
        const param = document.getElementById('paramInput').value;
        console.log('Fetching data with param:', param);
        const response = await fetch(`/data?param=${encodeURIComponent(param)}`);
        const data = await response.json();
        console.log('Data received:', data);

        cy = cytoscape({
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

        cy.on('cxttap', 'node', function(evt) {
            console.log('Right-click on node detected');
            const node = evt.target;

            if (highlightedNode) {
                highlightedNode.style('background-color', '#0074D9');
            }

            node.style('background-color', '#FF4136');
            highlightedNode = node;

            let menu = document.getElementById('contextMenu');
            if (!menu) {
                menu = document.createElement('div');
                menu.id = 'contextMenu';
                document.body.appendChild(menu);
            }

            evt.preventDefault();

            menu.style.top = `${evt.originalEvent.clientY}px`;
            menu.style.left = `${evt.originalEvent.clientX}px`;
            menu.classList.add('show');

            const addNodeButton = document.createElement('button');
            addNodeButton.innerText = 'Ajouter 4 nœuds';
            addNodeButton.onclick = async function() {
                await addNodes(node, 4);
                menu.classList.remove('show');
            };

            menu.innerHTML = '';
            menu.appendChild(addNodeButton);
        });

        cy.on('mouseover', 'node', function(evt) {
            const node = evt.target;
            node.addClass('node-hover');

            tooltip.innerText = `Node ID: ${node.id()}`;
            tooltip.style.display = 'block';
            tooltip.style.top = `${evt.renderedPosition.y}px`;
            tooltip.style.left = `${evt.renderedPosition.x}px`;
        });

        cy.on('mouseout', 'node', function(evt) {
            const node = evt.target;
            node.removeClass('node-hover');
            tooltip.style.display = 'none';
        });

        cy.on('mouseover', 'edge', function(evt) {
            const edge = evt.target;
            edge.addClass('edge-hover');

            tooltip.innerText = `Edge: ${edge.id()}`;
            tooltip.style.display = 'block';
            tooltip.style.top = `${evt.renderedPosition.y}px`;
            tooltip.style.left = `${evt.renderedPosition.x}px`;
        });

        cy.on('mouseout', 'edge', function(evt) {
            const edge = evt.target;
            edge.removeClass('edge-hover');
            tooltip.style.display = 'none';
        });

        document.addEventListener('click', function(event) {
            const contextMenu = document.getElementById('contextMenu');
            if (contextMenu && !contextMenu.contains(event.target)) {
                contextMenu.classList.remove('show');
            }
        });

        document.getElementById('recalculateButton').addEventListener('click', function() {
            cy.layout({
                name: 'cose'
            }).run();

            if (highlightedNode) {
                highlightedNode.style('background-color', '#FF4136');
            }
        });

        document.addEventListener('keydown', async function(event) {
            console.log('Key pressed:', event.key, 'with Alt key:', event.altKey); // Journal de débogage

            if (highlightedNode && event.altKey) {
                let numNodes = 0;
                switch (event.key) {
                    case '1':
                        numNodes = 1;
                        break;
                    case '2':
                        numNodes = 4;
                        break;
                    case '3':
                        numNodes = 6;
                        break;
                    default:
                        console.log('Unhandled key:', event.key); // Journal de débogage
                        return;
                }
                console.log('Adding', numNodes, 'nodes'); // Journal de débogage
                if (numNodes > 0) {
                    await addNodes(highlightedNode, numNodes);
                }
            }
        });

    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function addNodes(node, count) {
    if (!node) return;

    console.log('Adding nodes to:', node.id(), 'Count:', count); // Journal de débogage

    const response = await fetch('/add_nodes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ source_id: node.id(), count: count })
    });
    const newNodes = await response.json();
    console.log('New nodes received:', newNodes); // Journal de débogage

    
    cy.add(newNodes);

    const radius = 50;
    const angleStep = (2 * Math.PI) / newNodes.nodes.length;
    let index = 0;
    for (element of newNodes.nodes) {
        const angle = index * angleStep;
        index += 1;
        cy.getElementById(element.data.id).position({
            x: node.position('x') + radius * Math.cos(angle),
            y: node.position('y') + radius * Math.sin(angle)
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Document ready');
    document.getElementById('fetchButton').addEventListener('click', fetchData);
});
