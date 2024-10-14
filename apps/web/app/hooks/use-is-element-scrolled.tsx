import React from "react";

const useIsElementScrolled = (
	scrollContainerRef: React.RefObject<HTMLElement>,
) => {
	const [isScrolled, setIsScrolled] = React.useState(false);
	React.useEffect(() => {
		const element = scrollContainerRef.current;
		if (!element) return;

		const handleScroll = () => {
			if (element.scrollTop > 0) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		element.addEventListener("scroll", handleScroll);

		// Initial check to see if the element is already scrolled
		handleScroll();

		return () => {
			element.removeEventListener("scroll", handleScroll);
		};
	}, [scrollContainerRef]);
	return isScrolled;
};
export { useIsElementScrolled };
