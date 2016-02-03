export default function build() {

	var dataSys = {};

	dataSys.put = function(node, data) {
		dataSys[node] = data;
	};

	dataSys.get = function(node) {
		return dataSys[node];
	};

	return dataSys;
}
