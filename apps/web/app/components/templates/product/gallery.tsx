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
import { useNavigate } from "@remix-run/react";
import Image from "~/components/image";
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
								<Image
									onClick={(e) => e.stopPropagation()}
									src={url ?? toImageURL(base64, fileType)}
									alt={alt}
								/>
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
							<CarouselPrevious color="gray" variant="solid" />
							<CarouselNext color="gray" variant="solid" />
						</>
					)}
				</Carousel>
			</Flex>
		</Flex>
	);
}

const DesktopGallery = ({ images }: GalleryProps) => {
	const navigate = useNavigate();
	return (
		<Box className="hidden py-4 lg:flex flex-col w-full gap-4 items-center justify-center h-full overflow-y-scroll">
			{images.length === 0 && <Avatar fallback="F" />}
			<Carousel>
				<CarouselContent className="shadow-none w-screen lg:w-[calc(100vw-400px)]">
					{images.map(({ base64, url, alt, id, fileType }) => (
						<CarouselItem
							key={id}
							className={cn("shadow-none flex justify-center")}
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
							<Image
								onClick={(e) => e.stopPropagation()}
								src={url ?? toImageURL(base64, fileType)}
								alt={alt}
							/>
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
						<CarouselPrevious color="gray" variant="solid" />
						<CarouselNext color="gray" variant="solid" />
					</>
				)}
			</Carousel>
		</Box>
	);
};

export { DesktopGallery, MobileGallery };
