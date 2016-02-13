import { ids } from "kitsune/data";
import { logP } from "kitsune/util";

export function name(mapSys, stringSys, id, nameStr) {
	return stringSys.put(nameStr)
		.then(nameId => mapSys.put(nameId, ids.name, id));
}

export function getNodes(mapSys, stringSys, nameStr) {
	return stringSys.put(nameStr)
		.then(nameId => mapSys.get(nameId, ids.name));
}

export function getNames(mapSys, stringSys, id) {
	return mapSys.getHead(id, ids.name)
		.then(tails => stringSys.getMany(...tails));
}

export default function build({ mapSys, stringSys }) {
	return {
		name: name.bind(this, mapSys, stringSys),
		getNodes: getNodes.bind(this, mapSys, stringSys),
		getNames: getNames.bind(this, mapSys, stringSys)
	};
}
