import { useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";

export function Toploader() {
	const navigation = useNavigation();
	const [width, setWidth] = useState(0);
	const [opacity, setOpacity] = useState(0);

	useEffect(() => {
		if (navigation.state === "loading") {
			setOpacity(1);
			setWidth(30);
			const timer = setTimeout(() => setWidth(90), 500);
			return () => clearTimeout(timer);
		}
		if (navigation.state === "idle") {
			setWidth(100);
			const timer = setTimeout(() => {
				setOpacity(0);
				setWidth(0);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [navigation.state]);

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				height: "2px",
				backgroundColor: "var(--brand-9)",
				width: `${width}%`,
				opacity: opacity,
				transition: "width 300ms ease-in-out, opacity 300ms ease-in-out",
				zIndex: 9999,
			}}
		/>
	);
}
