import { cn } from "@blazzing-app/ui";
import React from "react";
import ImagePlaceholder from "./image-placeholder";

type Fit = "cover" | "contain" | "scale-down" | "crop" | "pad";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

function transformObject(obj: Record<string, string | number>): string {
	return Object.entries(obj)
		.map(([key, value]) => `${key}=${value}`)
		.join(",");
}

function removePublicSuffix(input: string): string {
	return input.endsWith("/public") ? input.slice(0, -7) : input;
}

type Responsive = {
	initial: number;
	sm?: number;
	md?: number;
	lg?: number;
	xl?: number;
	"2xl"?: number;
};

const Image = React.forwardRef<
	Omit<HTMLImageElement, "width" | "height">,
	Omit<React.ImgHTMLAttributes<HTMLImageElement>, "width" | "height"> & {
		src: string | undefined;
		width?: Responsive;
		height?: Responsive;
		quality?: number;
		fit?: Fit;
		fileType?: string;
	}
>(
	(
		{ className, fit, quality, width, height, alt, src, fileType, ...props },
		ref,
	) => {
		if (!src)
			return (
				<div
					className={cn(
						"flex aspect-square min-h-20 min-w-20 bg-transparent max-w-full justify-center items-center",
						className,
					)}
				>
					<ImagePlaceholder />
				</div>
			);

		if (!src.startsWith("http")) {
			// biome-ignore lint/a11y/useAltText: <explanation>
			return (
				<img
					//@ts-ignore
					ref={ref}
					alt={alt}
					className={cn(className)}
					src={src}
					{...props}
				/>
			);
		}

		const options = {
			...(fit && { fit }),
			...(width && { w: width.initial }),
			...(height && { h: height.initial }),
			...(quality && { quality }),
		};

		if (!fit && !width && !height && !quality) {
			return (
				// biome-ignore lint/a11y/useAltText: <explanation>
				<img
					//@ts-ignore
					ref={ref}
					alt={alt}
					className={cn(className)}
					src={src}
					{...props}
				/>
			);
		}

		const imageURL = removePublicSuffix(src);

		const srcSet = [
			width?.sm || height?.sm
				? `${imageURL}/${transformObject({ ...options, ...(width && { w: width.sm ?? width.initial }), ...(height && { h: height.sm ?? height.initial }) })} 640w`
				: "",
			width?.md || height?.md
				? `${imageURL}/${transformObject({ ...options, ...(width && { w: width.md ?? width.initial }), ...(height && { h: height.md ?? height.initial }) })} 768w`
				: "",
			width?.lg || height?.lg
				? `${imageURL}/${transformObject({ ...options, ...(width && { w: width.lg ?? width.initial }), ...(height && { h: height.lg ?? height.initial }) })} 1024w`
				: "",
			width?.xl || height?.xl
				? `${imageURL}/${transformObject({ ...options, ...(width && { w: width.xl ?? width.initial }), ...(height && { h: height.xl ?? height.initial }) })} 1280w`
				: "",
			width?.["2xl"] || height?.["2xl"]
				? `${imageURL}/${transformObject({ ...options, ...(width && { w: width["2xl"] ?? width.initial }), ...(height && { h: height["2xl"] ?? height.initial }) })} 1536w`
				: "",
		]
			.filter(Boolean)
			.join(", ");

		return (
			// biome-ignore lint/a11y/useAltText: <explanation>
			<img
				//@ts-ignore
				ref={ref}
				alt={alt}
				className={cn(className)}
				src={`${imageURL}/${transformObject(options)}`}
				srcSet={srcSet}
				{...props}
			/>
		);
	},
);

export default Image;
