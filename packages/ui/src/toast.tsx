import { toast as sonnerToast } from "sonner";
import { Icons } from "./icons";
import { LoadingSpinner } from "./loading";

const toast = {
	success(message: string) {
		return sonnerToast.success(message, {
			icon: <Icons.CircleCheck className="text-green-11" />,
			className:
				"bg-component text-black dark:text-white border-border border flex gap-3",
			closeButton: false,
		});
	},
	error(message: string) {
		return sonnerToast.error(message, {
			icon: <Icons.CircleError className="text-red-11" />,
			duration: 2000,
			className: "bg-component text-black dark:text-white border-border border",
		});
	},
	info(message: string) {
		return sonnerToast.info(message, {
			icon: <Icons.CircleInfo className="text-sapphire-11" />,
			className: "bg-component text-black dark:text-white border-border border",
		});
	},
	promise(message: string, promise: Promise<any>, errorMessage?: string) {
		return sonnerToast.promise(promise, {
			loading: <LoadingSpinner />,
			className: "bg-component text-black dark:text-white border-border border",
			success: () => {
				return (
					<span className="flex items-center gap-3">
						<Icons.CircleCheck className="text-green-11" />
						{message}
					</span>
				);
			},
			error: (error) => {
				console.error(JSON.stringify(error));

				return (
					<span className="flex items-center gap-2">
						<Icons.CircleError className="text-red-11" />
						{errorMessage}
					</span>
				);
			},
			cancelButtonStyle: {
				backgroundColor: "var(--gray-a-7)",

				color: "var(--gray-11)",
			},
			dismissible: true,
		});
	},
	loading(message: string) {
		return sonnerToast.loading(message, {
			icon: <LoadingSpinner />,
			className: "bg-component text-black dark:text-white border-border border",
		});
	},
};

export { toast };
