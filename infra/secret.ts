export const secret = {
	DatabaseURL: new sst.Secret("DatabaseURL"),
	LivekitURL: new sst.Secret("LivekitURL"),
	LivekitApiKey: new sst.Secret("LivekitApiKey"),
	LivekitSecretKey: new sst.Secret("LivekitSecretKey"),
	AccountID: new sst.Secret("AccountID"),
};

export const allSecrets = Object.values(secret);
