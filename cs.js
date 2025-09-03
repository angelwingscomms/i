function memorySizeOf(obj) {
	let bytes = 0;
	function sizeOf(obj) {
		if (obj !== null && obj !== undefined) {
			switch (typeof obj) {
				case 'number':
					bytes += 8;
					break;
				case 'string':
					bytes += obj.length * 2;
					break;
				case 'boolean':
					bytes += 4;
					break;
				case 'object':
					const objClass = Object.prototype.toString.call(obj).slice(8, -1);
					if (objClass === 'Object' || objClass === 'Array') {
						for (const key in obj) {
							if (!obj.hasOwnProperty(key)) continue;
							sizeOf(obj[key]);
						}
					} else {
						bytes += obj.toString().length * 2;
					}
					break;
			}
		}
		return bytes;
	}
	function format(bytes) {
		if (bytes < 1024) return bytes + ' bytes';
		if (bytes < 1048576) return (bytes / 1024).toFixed(3) + ' KiB';
		return (bytes / 1048576).toFixed(3) + ' MiB';
	}
	return sizeOf(obj);
}

console.log((memorySizeOf('0198cb9d-5d04-735d-99cc-6e1c1ff697') * 1440) / 1024);
