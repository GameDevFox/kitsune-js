export function put(edgeSys, node, key, value) {
	let first;
	return edgeSys.relate(node, value)
		.then(edgeId => {
			first = edgeId;
			return edgeSys.relate(key, edgeId);
		})
		.then(edgeId => {
			return {
				id: edgeId,
				head: key,
				tail: first
			};
		});
}

export function get(edgeSys, node, key) {
	return edgeSys.findByHead(key, node);
}



export default function bind(edgeSys) {
	return {
		put: put.bind(this, edgeSys)
	};
}
