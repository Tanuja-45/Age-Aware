import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';

// Define the types for the component's props
interface IconProps {
  color: string;
  focused: boolean;
}

const StatsIcon: React.FC<IconProps> = ({ color, focused }) => (
    <View style={{ 
        alignItems: 'center',
        backgroundColor: focused ? '#357ABD' : 'transparent',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    }}>
        <Svg height={26} width={26} viewBox="0 0 24 24">
            <Path fill={color} d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z"/>
        </Svg>
    </View>
);

export default StatsIcon;

