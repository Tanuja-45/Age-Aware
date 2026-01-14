import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';

// Define the types for the component's props
interface IconProps {
  color: string;
  focused: boolean;
}

const HomeIcon: React.FC<IconProps> = ({ color, focused }) => (
    <View style={{ 
        alignItems: 'center', 
        backgroundColor: focused ? '#357ABD' : 'transparent',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    }}>
        <Svg height={26} width={26} viewBox="0 0 24 24">
            <Path fill={color} d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </Svg>
    </View>
);

export default HomeIcon;

