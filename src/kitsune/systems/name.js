import ids from "kitsune/ids";
import { logP } from "kitsune/util";

export function name(dictSys, stringSys, id, nameStr) {
	return stringSys.put(nameStr)
		.then(nameId => dictSys.put(nameId, ids.name, id));
}

export function getNodes(edgeSys, stringSys, nameStr) {
	return stringSys.put(nameStr)
		.then(nameId => edgeSys.findByHead(ids.name, nameId));
}

export function getNames(edgeSys, stringSys, id) {
	return edgeSys.findByTail(ids.name, id)
		.then(tails => stringSys.getMany(...tails));
}

export default function build({ dictSys, edgeSys, stringSys }) {
	return {
		name: name.bind(this, dictSys, stringSys),
		getNodes: getNodes.bind(this, edgeSys, stringSys),
		getNames: getNames.bind(this, edgeSys, stringSys)
	};
}
