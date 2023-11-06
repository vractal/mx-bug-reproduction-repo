import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			refetchOnWindowFocus: true,
			staleTime: 1000 * 60 * 60 * 1 // 1 hour
		},
		mutations: {
			retry: false
		}
	}
});

export const ReactQueryProvider = ({ children }: PropsWithChildren) => {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
