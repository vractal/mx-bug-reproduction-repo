import MUICircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';

export const CircularProgress = ({ size = 22, ...props }: CircularProgressProps) => {
	return <MUICircularProgress size={size} {...props} />;
};
