import { cn } from "@blazzing-app/ui";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@blazzing-app/ui/carousel";
import type { Image as ImageType } from "@blazzing-app/validators";
import { Avatar, Box, Flex } from "@radix-ui/themes";
import { toImageURL } from "~/utils/helpers";

interface GalleryProps {
	images: ImageType[];
	isScrolled?: boolean;
}

function MobileGallery({ images, isScrolled }: GalleryProps) {
	return (
		<Flex
			direction="column"
			align="center"
			className={cn(
				"sticky top-0 lg:hidden h-full transition-all duration-400 ease-in-out flex flex-col items-center w-full gap-4",
				{
					"brightness-50 scale-90": isScrolled,
				},
			)}
		>
			<Flex direction="column" justify="center" align="center" gap="4">
				<Carousel>
					<CarouselContent className="shadow-none">
						{images.map(({ base64, url, alt, id, fileType }) => (
							<CarouselItem
								key={id}
								className={cn("shadow-none w-full flex justify-center")}
								onClick={(e) => e.stopPropagation()}
							>
								{!url ? (
									<img
										alt={alt}
										className={cn(
											"md:rounded-lg w-max max-w-full select-none object-contain object-center",
										)}
										src={toImageURL(base64, fileType)}
									/>
								) : (
									<Avatar fallback="2" />
								)}
							</CarouselItem>
						))}
						{images.length === 0 && (
							<CarouselItem className="aspect-square">
								<Avatar fallback="2" />
							</CarouselItem>
						)}
					</CarouselContent>

					{images.length > 0 && (
						<>
							<CarouselPrevious onClick={(e) => e.stopPropagation()} />
							<CarouselNext onClick={(e) => e.stopPropagation()} />
						</>
					)}
				</Carousel>
			</Flex>
		</Flex>
	);
}

const DesktopGallery = ({ images }: GalleryProps) => {
	return (
		<Box className="hidden py-4 lg:flex flex-col w-full gap-4 items-center justify-center h-full overflow-y-scroll">
			{images.map(({ base64, url, alt, id, fileType }) => {
				if (!url)
					return (
						// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
						<img
							key={id}
							alt={alt}
							className={cn(
								"w-max max-w-full select-none object-contain object-center",
							)}
							src={toImageURL(base64, fileType)}
							onClick={(e) => e.stopPropagation()}
						/>
					);
				return <Avatar fallback="F" key={id} />;
			})}
			{images.length === 0 && <Avatar fallback="F" />}
		</Box>
	);
};

export { DesktopGallery, MobileGallery };
