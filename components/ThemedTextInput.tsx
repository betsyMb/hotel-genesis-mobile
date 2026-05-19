import {useRef, useState} from "react";
import {StyleSheet, TextInput, TextInputProps, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useThemeColor} from "@/hooks/use-theme-color";

interface Props extends TextInputProps {
	icon?: keyof typeof Ionicons.glyphMap;
}


const ThemedTextInput = ({icon, style, ...rest}: Props) => {
	const primaryColor = useThemeColor({}, 'tabIconSelected');
	const textColor = useThemeColor({}, 'text');

	const [isActive, setIsActive] = useState(false);
	const inputRef = useRef<TextInput>(null);


	return (
		<View
			style={[
				{
					...styles.border,
						borderColor: textColor,
					borderBottomColor: isActive ? primaryColor : '#ccc',
				},
				style,
		]}
			onTouchStart={() => inputRef.current?.focus()}
	>

		{icon && (
			<Ionicons
				name={icon}
				size={24}
				color={textColor}
				style={{marginRight: 10}}
			/>
		)}

		<TextInput
			ref={inputRef}
			onFocus={() => setIsActive(true)}
			onBlur={() => setIsActive(false)}
			style={{
				color: textColor,
				marginRight: 10,
				flex: 1
			}}
			{...rest}
		/>

	</View>
	)
}

export default ThemedTextInput;

const styles = StyleSheet.create({
	border: {
		borderWidth: 1,
		borderRadius: 5,
		padding: 10,
		marginBottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
	}
})