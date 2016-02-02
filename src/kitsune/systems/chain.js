import { ids } from "kitsune/ids";
import { createId, logP, one } from "kitsune/util";

export function create(mapSys, nodes) {
	let head = createId();
	let nodeList = [head];
	nodeList = nodeList.concat(nodes.slice());

	// Chain loop
	let p = mapSys.put(nodeList[0], ids.chain, nodeList[1]);
	nodeList.splice(0, 2);

	for(var i=0; i<nodeList.length; i++) {
		p = p.then(edge => {
			var result = mapSys.put(edge.id, ids.chain, nodeList[0]);
			nodeList.splice(0, 1);
			return result;
		});
	}

	return p.then(() => head);
}

export function next(mapSys, node) {
	return mapSys.getEdge(node, ids.chain)
		.then(edge => {
			if(!edge.length)
				return;
			else if(edge.length == 1) {
				return {
					iter: edge[0].id,
					next: edge[0].tail
				};
			} else
				throw new Error("More than one \"chain\" mapping found on node: " + node);
		});
}

function doNext(mapSys, iter, list) {
	return next(mapSys, iter)
		.then(result => {
			if(!result)
				return list;

			list.push(result.next);
			return doNext(mapSys, result.iter, list);
		});
}

export function getAll(mapSys, chain) {
	return new Promise(function(resolve, reject) {
		var list = [];
		doNext(mapSys, chain, list)
			.then(resolve);
	});
}

export default function bind({ mapSys }) {
	return {
		create: create.bind(this, mapSys),
		next: next.bind(this, mapSys),
		getAll: getAll.bind(this, mapSys)
	};
}
