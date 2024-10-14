import type { Area } from "~/types/crop";
import * as base64 from "base64-arraybuffer";
import type { Image } from "@blazzing-app/validators";
import { generateID } from "@blazzing-app/utils";
export const createImage = (url: string) =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener("load", () => resolve(image));
		image.setAttribute("crossorigin", "anonymous");
		image.addEventListener("error", (error) => reject(error));
		image.src = url;
	});

export function getRadianAngle(degreeValue: number) {
	return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
	const rotRad = getRadianAngle(rotation);

	return {
		width:
			Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
		height:
			Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
	};
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
	imageSrc: string | undefined,
	pixelCrop: Area,
	rotation = 0,
	flip = { horizontal: false, vertical: false },
): Promise<Image | undefined> {
	if (!imageSrc) return undefined;
	const image = (await createImage(imageSrc)) as HTMLImageElement;
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		return undefined;
	}

	const rotRad = getRadianAngle(rotation);
	const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
		image.width,
		image.height,
		rotation,
	);

	// Set canvas size to match the bounding box
	canvas.width = bBoxWidth;
	canvas.height = bBoxHeight;

	// Clear the canvas for transparency
	ctx.clearRect(0, 0, bBoxWidth, bBoxHeight);

	// Translate and rotate
	ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
	ctx.rotate(rotRad);
	ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
	ctx.translate(-image.width / 2, -image.height / 2);

	// Draw the rotated image
	ctx.drawImage(image, 0, 0);

	const croppedCanvas = document.createElement("canvas");
	const croppedCtx = croppedCanvas.getContext("2d");

	if (!croppedCtx) {
		return undefined;
	}

	croppedCanvas.width = pixelCrop.width;
	croppedCanvas.height = pixelCrop.height;

	// Draw the cropped image onto the new canvas
	croppedCtx.drawImage(
		canvas,
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
		0,
		0,
		pixelCrop.width,
		pixelCrop.height,
	);

	// As a blob with PNG format for transparency
	return new Promise((resolve) => {
		croppedCanvas.toBlob((blob) => {
			if (blob) {
				const fileReader = new FileReader();
				fileReader.onloadend = () => {
					if (fileReader.result instanceof ArrayBuffer) {
						const base64String = base64.encode(fileReader.result);
						const imageKey = generateID({ prefix: "img" });
						return resolve({
							id: imageKey,
							fileType: blob.type,
							alt: "header image",
							order: 0,
							base64: base64String,
						} satisfies Image);
					}
				};
				fileReader.readAsArrayBuffer(blob);
			} else {
				resolve(undefined);
			}
		}, "image/png"); // Use PNG for transparency
	});
}
