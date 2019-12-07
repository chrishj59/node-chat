const generateMessage = (username, text) => {
	return {
		username,
		text,
		createdAt: new Date().getTime()
	};
};

const generateLocationMessage = (username, url) => {
	return {
		username,
		url,
		createdAt: new Date().getTime()
	};
};

const generateImageMessage = (username, name, contents) => {
	return {
		username,
		name,
		contents,
		createdAt: new Date().getTime
	};
};

module.exports = {
	generateMessage,
	generateLocationMessage,
	generateImageMessage
};
