import { useState, useEffect } from "react";
import debounce from "lodash.debounce";

function useWindowSize(debounceNumber?: number) {
	const [windowSize, setWindowSize] = useState({
		width: 0,
		height: 0,
	});

	useEffect(() => {
		// Handler to call on window resize
		const handleResize = debounce(() => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}, debounceNumber ?? 0); // Debounce for 100ms

		// Add event listener
		window.addEventListener("resize", handleResize);

		// Call handler right away so state gets updated with initial window size
		handleResize();

		// Remove event listener on cleanup
		return () => {
			handleResize.cancel(); // Cancel the debounce on cleanup to prevent delayed execution
			window.removeEventListener("resize", handleResize);
		};
	}, [debounceNumber]); // Empty array ensures that effect is only run on mount and unmount

	return windowSize;
}
export { useWindowSize };
