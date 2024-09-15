import { Icons } from "@blazzing-app/ui/icons";
import {
	DropdownMenu,
	Flex,
	Grid,
	Heading,
	IconButton,
	ScrollArea,
	Text,
} from "@radix-ui/themes";
import { Link } from "@remix-run/react";

const NotificationDropdown = () => {
	const mockNotifications = [
		{
			id: "1",
			title: "Order placed.",
			description: "You have bought x for $y",
		},
	];
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<IconButton variant="surface" size="3">
					<Icons.Notification className="w-5 h-5 text-accent-11" />
					<span className="sr-only">Notifications</span>
				</IconButton>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				align="center"
				className="backdrop-blur-sm min-w-[300px] max-h-[400px] "
			>
				<ScrollArea className="height-[380px]" scrollbars="vertical">
					{mockNotifications.map((n) => (
						<Link
							to="#"
							key={n.id}
							prefetch="intent"
							className="hover:bg-gray-3 dark:bg- gray-5 p-1 px-2 items-center gap-2 flex height-[60px]"
						>
							<Flex
								align="center"
								justify="center"
								width="40px"
								height="40px"
								className="bg-accent-7"
							>
								<Icons.User className="text-accent-10" />
							</Flex>
							<Grid py="1">
								<Heading size="2" className="overflow-hidden text-ellipsis">
									{n.title}
								</Heading>
								<Text
									size="2"
									color="gray"
									className="overflow-hidden text-ellipsis "
								>
									{n.description}
								</Text>
							</Grid>
						</Link>
					))}
				</ScrollArea>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
};
export { NotificationDropdown };
