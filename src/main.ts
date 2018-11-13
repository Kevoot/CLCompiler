import { Parser } from './Parser';
import { Scanner } from './Scanner';
import { PDANode } from './PDANode';
import * as vis from 'vis';
import { initGlobals, Nodes, EdgeList } from './utils';
import { convertProgram } from './templates';

const demoString = 'read n<br />cp := 0<br />' +
    'while cp <= n {<br />cf := 1<br />out := 1<br />while cf <= cp {<br />' +
    'out := out * 2<br />cf := cf + 1<br />}<br />write out<br />' +
    'cp := cp + 1<br />}<br />';

export function main(input: string) {
    let parser = new Parser();

    parser.scanner = new Scanner(input);

    let rootNode: PDANode | number = new PDANode();

    try {
        parser.inputToken = parser.scanner.scan();
        rootNode = parser.program();
    }
    catch (e) {
        console.log('Error handled, message: ' + e);
    }

    console.log('Tree generated');

    console.log('Results: ');
    console.log(parser.recur_print(<PDANode>rootNode));

    return rootNode;
}

export function displayData(rootNode) {
    let dataSet = [];
    let cleanNodes = new Array<PDANode>();
    for (let node of Nodes) {
        if (node.children.length > 0 || node.parent !== undefined) {
            cleanNodes.push(node);
        }
    }

    let cleanEdges = [];
    for (let node of cleanNodes) {
        if (node.parent !== undefined) {
            cleanEdges.push({
                from: node.id, to: node.parent.id, label: undefined
            });
        }
    }

    let removalNodes = [];
    for (let node of cleanNodes) {
        if (cleanEdges.findIndex(entry => entry.from === node.id) < 0) {
            if (cleanEdges.findIndex(entry => entry.to === node.id) < 0) {
                removalNodes.push(node);
            }
        }
    }

    cleanNodes = cleanNodes.filter(function (el) {
        return removalNodes.indexOf(el) < 0;
    });

    for (let node of cleanNodes) {
        dataSet.push({ id: node.id, label: node.data });
    }
    /*for (let node of Nodes) {
        dataSet.push({ id: node.id, label: node.data});
    }*/
    var nodes = new vis.DataSet(dataSet);
    var set = new vis.DataSet(cleanEdges);
    // var set = new vis.DataSet(EdgeList);

    // create a network
    var container = document.getElementById('mynetwork');

    var data = {
        nodes: nodes,
        edges: set
    };
    let options: vis.Options = {
        edges: {
            arrows: {
                to: {
                    enabled: true
                },
                middle: {
                    enabled: false
                },
                from: {
                    enabled: false
                }
            }
        },
        layout: {
            hierarchical: {
                direction: 'DU',
                sortMethod: 'directed',
                levelSeparation: -83,
                nodeSpacing: 180,
                treeSpacing: 265
            }
        },
        interaction: { dragNodes: false },
        physics: {
            enabled: false
        },
        configure: {
            filter: function (option, path) {
                if (path.indexOf('hierarchical') !== -1) {
                    return true;
                }
                return false;
            },
            showButton: false
        }
    };
    var network = new vis.Network(container, data, options);
}

$(document).on('click', '#pdaSubmitButton', () => {
    initGlobals();
    let input = (<HTMLInputElement>document.getElementById('inputString')).value;
    input = input.replace(/(\r\n\t|\n|\r\t)/gm, ' ');
    let root = main(input);
    displayData(root);

    // Scroll down to generated tree
    $('#mynetwork').get(0).scrollIntoView();

    let conv = convertProgram(<PDANode>root);
    let v = new Function(conv);
    (<HTMLInputElement>document.getElementById('outputString')).value = conv;
    v();
});

$(document).on('click', '#copyButton', () => {
    let regex = /<br\s*[\/]?>/gi;
    $('#inputString').html(demoString.replace(regex, '\n'));
});
