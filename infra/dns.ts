export const domain =
	{
		production: "blazzing.app",
		dev: "dev.blazzing.app",
	}[$app.stage] || `${$app.stage}.dev.blazzing.app`;

export const zone = cloudflare.getZoneOutput({
	name: "blazzing.app",
});
