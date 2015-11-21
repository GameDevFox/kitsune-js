import ids from "kitsune/ids";
import { logP } from "kitsune/util";

export function name(relSys, stringSys, id, nameStr) {
	return stringSys.put(nameStr)
		.then(nameId => relSys.assign(ids.name, id, nameId));
}

export function getNodes(relSys, stringSys, nameStr) {
	return stringSys.put(nameStr)
		.then(nameId => relSys.findByTail(ids.name, nameId));
}

export function getNames(relSys, stringSys, id) {
	return relSys.findByHead(ids.name, id)
		.then(tails => stringSys.getAll(...tails))
}

export default function build({ relSys: relSys, stringSys: stringSys }) {
	return {
		name: name.bind(this, relSys, stringSys),
		getNodes: getNodes.bind(this, relSys, stringSys),
		getNames: getNames.bind(this, relSys, stringSys)
	};
}
