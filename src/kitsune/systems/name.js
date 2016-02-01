import ids from "kitsune/ids";
import { logP } from "kitsune/util";

export function name(dictSys, stringSys, id, nameStr) {
	return stringSys.put(nameStr)
		.then(nameId => dictSys.put(nameId, ids.name, id));
}

export function getNodes(dictSys, stringSys, nameStr) {
	return stringSys.put(nameStr)
		.then(nameId => dictSys.get(nameId, ids.name));
}

export function getNames(dictSys, stringSys, id) {
	return dictSys.getHead(id, ids.name)
		.then(tails => stringSys.getMany(...tails));
}

export default function build({ dictSys, stringSys }) {
	return {
		name: name.bind(this, dictSys, stringSys),
		getNodes: getNodes.bind(this, dictSys, stringSys),
		getNames: getNames.bind(this, dictSys, stringSys)
	};
}
