export const secret = {
	DatabaseURL: new sst.Secret("DatabaseURL"),
	Test: new sst.Secret("Test", "Hello, World!"),
};

export const allSecrets = Object.values(secret);
