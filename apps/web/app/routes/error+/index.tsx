import { Flex, Heading, Text } from "@radix-ui/themes";
import { useSearchParams } from "@remix-run/react";

export default function ErrorPage() {
	const [param] = useSearchParams();
	return (
		<Flex justify="center" height="100vh" align="center">
			<Heading>
				Error: <Text className="text-red-11">{param.get("error")}</Text>
			</Heading>
		</Flex>
	);
}
