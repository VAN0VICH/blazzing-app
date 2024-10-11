import { cn } from "@blazzing-app/ui";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	useCarousel,
} from "@blazzing-app/ui/carousel";
import type { Image as ImageType } from "@blazzing-app/validators";
import { Flex } from "@radix-ui/themes";
import { useNavigate } from "@remix-run/react";
import React from "react";
import Image from "~/components/image";
import ImagePlaceholder from "~/components/image-placeholder";
import { toImageURL } from "~/utils/helpers";

interface GalleryProps {
	images: ImageType[];
	isScrolled?: boolean;
}

const Gallery = ({ images }: GalleryProps) => {
	const navigate = useNavigate();
	return (
		<Flex
			align="center"
			justify="center"
			height="100%"
			gap="4"
			onClick={(e) => {
				console.log("clicked 2");
				e.stopPropagation();

				navigate("/marketplace", {
					preventScrollReset: true,
					unstable_viewTransition: true,
					replace: true,
				});
			}}
		>
			<Carousel>
				<CarouselContent className="shadow-none px-3 w-screen lg:w-[calc(100vw-400px)]">
					{images.map(({ base64, url, alt, id, fileType }) => (
						<CarouselItem
							key={id}
							className={cn(
								"shadow-none lg:w-[calc(100vw-400px)] w-screen flex justify-center",
							)}
						>
							<Image
								onClick={(e) => e.stopPropagation()}
								src={url ?? toImageURL(base64, fileType)}
								alt={alt}
								className="rounded-[7px]"
							/>
						</CarouselItem>
					))}
					{images.length === 0 && (
						<CarouselItem className="aspect-square flex justify-center items-center lg:w-[calc(100vw-400px)] w-screen">
							<ImagePlaceholder size={40} />
						</CarouselItem>
					)}
				</CarouselContent>

				<NavigationButtons imagesLength={images.length} />
			</Carousel>
		</Flex>
	);
};

const NavigationButtons = ({ imagesLength }: { imagesLength: number }) => {
	const { scrollNext, scrollPrev } = useCarousel();
	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowRight") {
				scrollNext();
			}
			if (event.key === "ArrowLeft") {
				scrollPrev();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [scrollNext, scrollPrev]);

	if (imagesLength === 0) return null;
	return (
		<>
			<CarouselPrevious variant="outline" size="4" />
			<CarouselNext variant="outline" size="4" />
		</>
	);
};

export { Gallery };
