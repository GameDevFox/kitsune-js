export function put(edgeSys, node, key, value) {
	return edgeSys.assign(key, node, value);
}

export function get(edgeSys, node, key) {
	return edgeSys.findByHead(key, node);
}

export default function bind(edgeSys) {
	return {
		put: put.bind(this, edgeSys)
	};
}
