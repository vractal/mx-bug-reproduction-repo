interface Window {
	ic: {
		plug?: {
			batchTransactions: (batch: BatchTransaction[]) => Promise<void>;
			requestConnect: (args: RequestConnect) => Promise<void>;
			createActor: <T>(args: CreateActor) => Promise<T>;
			getPrincipal: () => Promise<Principal>;
			disconnect: () => Promise<void>;
			requestConnect: (args: RequestConnect) => Promise<void>;
		};
		infinityWallet?: {
			batchTransactions: (batch: BatchTransaction[]) => Promise<void>;
			requestConnect: (args: RequestConnect) => Promise<void>;
			createActor: <T>(args: CreateActor) => Promise<T>;
			getPrincipal: () => Promise<Principal>;
			disconnect: () => Promise<void>;
			requestConnect: (args: RequestConnect) => Promise<void>;
		};
	};
}

interface BatchTransaction {
	idl: IDL.InterfaceFactory;
	canisterId: string;
	methodName: string;
	args: TransferArg[];
	onSuccess: (res: Result) => void;
	onFail: (res: Result) => void;
}

interface RequestConnect {
	whitelist?: string[];
	host?: string;
	onConnectionUpdate?: () => void;
	timeout?: number;
}

interface CreateActor {
	canisterId: string;
	interfaceFactory: IDL.InterfaceFactory;
}

interface RequestConnect {
	whitelist: string;
}
