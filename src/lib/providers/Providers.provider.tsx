import { PropsWithChildren } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ReactQueryProvider } from './ReactQuery.provider';
import { RecoilRoot } from 'recoil';

export const Providers = ({ children }: PropsWithChildren) => {
	return (
		<ReactQueryProvider>
			<RecoilRoot>
				<HelmetProvider>{children}</HelmetProvider>
			</RecoilRoot>
		</ReactQueryProvider>
	);
};
