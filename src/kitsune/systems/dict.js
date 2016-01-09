export function put(edgeSys, node, key, value) {
	return null;
}

export default function bind(edgeSys) {
	return {
		put: put.bind(this, edgeSys)
	}
}