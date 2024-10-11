import { Button } from "@radix-ui/themes";
import { Link } from "@remix-run/react";
import { useDebounce } from "@uidotdev/usehooks";
import { motion } from "framer-motion";

export function Intro() {
	const showText = useDebounce(true, 800);

	return (
		<motion.div
			className="flex size-full flex-col items-center justify-center"
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.3, type: "spring" }}
		>
			{showText && (
				<motion.div
					variants={{
						show: {
							transition: {
								staggerChildren: 0.2,
							},
						},
					}}
					initial="hidden"
					animate="show"
					className="mx-5 flex flex-col items-center space-y-2.5 text-center sm:mx-auto"
				>
					<motion.h1
						className="text-balance text-4xl font-freeman transition-colors sm:text-6xl"
						variants={{
							hidden: { opacity: 0, y: 50 },
							show: {
								opacity: 1,
								y: 0,
								transition: { duration: 0.4, type: "spring" },
							},
						}}
					>
						Welcome to{" "}
						<span className="text-balance bg-gradient-to-b from-brand-9 to-brand-11 bg-clip-text text-5xl font-bold text-transparent lg:text-6xl lg:tracking-tight xl:text-7xl">
							Blazell
						</span>
					</motion.h1>
					<motion.p
						className="max-w-md text-muted-foreground transition-colors sm:text-lg"
						variants={{
							hidden: { opacity: 0, y: 50 },
							show: {
								opacity: 1,
								y: 0,
								transition: { duration: 0.4, type: "spring" },
							},
						}}
					>
						Get started with your new store in just a few steps and start
						selling your products online.
					</motion.p>
					<motion.div
						className="pt-4"
						variants={{
							hidden: { opacity: 0, y: 50 },
							show: {
								opacity: 1,
								y: 0,
								transition: { duration: 0.4, type: "spring" },
							},
						}}
					>
						<Link to="/onboarding?step=create">
							<Button variant="classic">Get started</Button>
						</Link>
					</motion.div>
				</motion.div>
			)}
		</motion.div>
	);
}
