import { useEffect, useState } from "react";

export const demoLoadingDelayMs = 300;

export const useDemoLoading = (loadKey: string | number) => {
	const [loadingState, setLoadingState] = useState({
		loadKey,
		isLoading: true,
	});

	useEffect(() => {
		const timer = window.setTimeout(
			() => setLoadingState({ loadKey, isLoading: false }),
			demoLoadingDelayMs,
		);
		return () => window.clearTimeout(timer);
	}, [loadKey]);

	return loadingState.loadKey === loadKey ? loadingState.isLoading : true;
};
