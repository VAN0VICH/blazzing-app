import { TagInput } from "@blazzing-app/ui/tag-input";
import { Flex, TextField } from "@radix-ui/themes";
import React from "react";
const Test = () => {
	const [value, setValue] = React.useState<string[]>([]);
	return (
		<Flex justify="center" m="9" align="center" width="400px" height="400px">
			<TagInput onChange={setValue} value={value} />
			<TextField.Root />
		</Flex>
	);
};

export default Test;
