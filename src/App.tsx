import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Providers } from 'lib/providers';
import { ChatPage } from 'pages/ChatPage.components';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/chat">
					<Route
						index
						element={
							<Providers>
								<ChatPage />
							</Providers>
						}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
