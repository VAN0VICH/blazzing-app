import { cn } from "@blazzing-app/ui";
import { useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "~/types/crop";
export const ASPECT_RATIO = 5 / 2;
const CropImage = ({
	src,
	crop,
	setCrop,
	setCroppedArea,
	onCropComplete,
	type,
}: {
	src: string;
	setCroppedArea: React.Dispatch<React.SetStateAction<Area>>;
	onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
	setCrop: React.Dispatch<React.SetStateAction<Point | undefined>>;
	crop: Point | undefined;
	type: "store" | "header";
}) => {
	const [zoom, setZoom] = useState(1);

	return (
		<div
			className={cn(
				"md:w-[600px] max-h-[500px] md:h-[500px] w-full h-[80vh] z-40",
			)}
		>
			<Cropper
				image={src}
				aspect={ASPECT_RATIO}
				crop={crop ?? { x: 0, y: 0 }}
				zoom={zoom}
				onCropChange={setCrop}
				classes={{ containerClassName: "h-[500px]" }}
				onZoomChange={setZoom}
				onCropAreaChange={setCroppedArea}
				onCropComplete={onCropComplete}
				{...(type === "store" && {
					cropShape: "round",
					aspect: 1,
					showGrid: false,
				})}
			/>
		</div>
	);
};

export default CropImage;
