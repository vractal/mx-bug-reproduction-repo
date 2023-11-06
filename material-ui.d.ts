/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Palette as MuiPallete,
	PaletteOptions as MuiPaletteOptions,
	PaletteColorOptions,
	PaletteColor
} from '@mui/material/styles/createPalette';

declare module '@mui/material/Button' {
	interface ButtonPropsVariantOverrides {
		dashed: true;
		tertiary: true;
	}
}

declare module '@mui/material/styles' {
	interface Palette {
		'error-secondary': PaletteColor;
		button: {
			border: string;
			hoverBorder: string;
		};
		gradient: {
			primary: {
				light: string;
				main: string;
			};
			secondary: {
				light: string;
				main: string;
			};
		};
		dialog: {
			boxShadow: string;
			background: string;
			border: string;
		};
		field: {
			background: string;
			border: string;
			hoverBorder: string;
			focusBorder: string;
			disabledBorder: string;
		};
		menu: {
			border: string;
			backgroundHover: string;
			backgroundSelected: string;
		};
		tooltip: {
			backgroundColor: string;
		};
		autocomplete: {
			selectedChip: string;
		};
		drawer: {
			mobile: {
				background: string;
			};
		};
		card: {
			actionBackground: string;
			boostedBackground: string;
			selectedBorder: string;
			selectedBackground: string;
		};
		tag: {
			primary: {
				color: string;
				backgroundColor: string;
			};
			secondary: {
				color: string;
				backgroundColor: string;
			};
		};
		metaInfoChip: string;
		bottomNav: {
			background: string;
			borderColor: string;
			boxShadow: string;
		};
		avatarBannerUpload: {
			background: string;
			border: string;
		};
		checkedBackground: string;
		futureEvents: {
			background: string;
			border: string;
		};
		calendar: {
			navigation: string;
			dow: string;
			event: string;
			hover: string;
		};
		switch: {
			uncheckedColor: string;
			background: string;
			border: string;
		};
		avatarBorder: string;
		chats: {
			header: {
				backgroundColor: string;
			};
		};
		notification: {
			background: string;
			iconBackground: string;
		};
		background: {
			transparentPaper: string;
		};
		tip: {
			amount: {
				activeBorder: string;
				background: string;
			};
		};
		table: {
			border: string;
			row: {
				odd: string;
				even: string;
			};
		};
		message: {
			background: {
				default: string;
				transparent: string;
			};
		};
		messageControls: {
			background: string;
			border: string;
		};
	}

	interface PaletteOptions {
		'error-secondary': PaletteColorOptions;
		button: {
			border: string;
			hoverBorder: string;
		};
		gradient: {
			primary: {
				light: string;
				main: string;
			};
			secondary: {
				light: string;
				main: string;
			};
		};
		dialog: {
			boxShadow: string;
			background: string;
			border: string;
		};
		field: {
			background: string;
			border: string;
			hoverBorder: string;
			focusBorder: string;
			disabledBorder: string;
		};
		menu: {
			border: string;
			backgroundHover: string;
			backgroundSelected: string;
		};
		tooltip: {
			backgroundColor: string;
		};
		autocomplete: {
			selectedChip: string;
		};
		drawer: {
			mobile: {
				background: string;
			};
		};
		card: {
			actionBackground: string;
			boostedBackground: string;
			selectedBorder: string;
			selectedBackground: string;
		};
		tag: {
			primary: {
				color: string;
				backgroundColor: string;
			};
			secondary: {
				color: string;
				backgroundColor: string;
			};
		};
		metaInfoChip: string;
		bottomNav: {
			background: string;
			borderColor: string;
			boxShadow: string;
		};
		avatarBannerUpload: {
			background: string;
			border: string;
		};
		checkedBackground: string;
		futureEvents: {
			background: string;
			border: string;
		};
		calendar: {
			navigation: string;
			dow: string;
			event: string;
			hover: string;
		};
		switch: {
			uncheckedColor: string;
			background: string;
			border: string;
		};
		avatarBorder: string;
		chats: {
			header: {
				backgroundColor: string;
			};
		};
		notification: {
			background: string;
			iconBackground: string;
		};
		tip: {
			amount: {
				activeBorder: string;
				background: string;
			};
		};
		table: {
			border: string;
			row: {
				odd: string;
				even: string;
			};
		};
		background: {
			transparentPaper: string;
		};
		message: {
			background: {
				default: string;
				transparent: string;
			};
		};
		messageControls: {
			background: string;
			border: string;
		};
	}

	interface ZIndex {
		bottomNav: number;
	}

	interface TypeBackground {
		transparentPaper: string;
	}
}


declare module '@mui/material/TextField' {
	interface TextFieldPropsSizeOverrides {
		large: true;
	}
}

declare module '@mui/material/Button' {
	interface ButtonPropsColorOverrides {
		'error-secondary': true;
	}
}
