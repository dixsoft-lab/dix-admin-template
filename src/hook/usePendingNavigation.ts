import { useEffect, useState } from "react";

export const usePendingNavigation = (
	pending: boolean,
	navigate: (target: string) => void,
) => {
	const [queuedTarget, setQueuedTarget] = useState<string | null>(null);
	useEffect(() => {
		if (pending || queuedTarget === null) return;
		setQueuedTarget(null);
		navigate(queuedTarget);
	}, [pending, queuedTarget, navigate]);
	const requestNavigation = (target: string) => {
		if (pending) setQueuedTarget(target);
		else navigate(target);
	};
	const cancelNavigation = () => setQueuedTarget(null);
	return {
		requestNavigation,
		cancelNavigation,
		hasQueuedNavigation: queuedTarget !== null,
	};
};
