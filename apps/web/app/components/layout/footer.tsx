import { Box, Grid, Heading, Text } from "@radix-ui/themes";

export default function Footer() {
	return (
		<footer className="bg-component w-full border-t border-border">
			<Box className="max-w-screen-xl p-4 py-6 mx-auto lg:py-16 md:p-8 lg:p-10">
				<Grid className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
					<Box>
						<Heading>Company</Heading>
						<ul>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									About
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Careers
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Brand Center
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Blog
								</a>
							</li>
						</ul>
					</Box>
					<Box>
						<Heading>Help Center</Heading>
						<ul>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Contact Us
								</a>
							</li>
						</ul>
					</Box>
					<Box>
						<Heading>Legal</Heading>
						<ul>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Privacy Policy
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Licensing
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Terms
								</a>
							</li>
						</ul>
					</Box>
					<Box>
						<Heading>Community</Heading>
						<ul>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Discord
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Twitter
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Instagram
								</a>
							</li>
							<li className="mb-4">
								<a href="/" className="hover:underline">
									Tiktok
								</a>
							</li>
						</ul>
					</Box>
				</Grid>

				<hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
				<Box className="text-center">
					<Text color="gray">
						© 2024 Blazell™. All Rights Reserved. Built by
						<p className="text-accent-11 pl-1 font-bold">LordPachi</p>.
					</Text>
					<ul className="flex justify-center mt-5 space-x-5">
						{/* SVG icons here for social media links */}
					</ul>
				</Box>
			</Box>
		</footer>
	);
}
