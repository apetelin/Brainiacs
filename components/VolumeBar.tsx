import * as React from 'react';

interface VolumeBarProps {
    volume: number;
    maxVolume: number;
    maxPossibleVolume: number;
}

export const VolumeBar: React.FC<VolumeBarProps> = ({ volume, maxVolume, maxPossibleVolume }) => {
    const volumePercentage = Math.round((volume / maxPossibleVolume) * 100);
    const maxVolumePercentage = Math.round((maxVolume / maxPossibleVolume) * 100);

    return (
        <div className="flex items-center" style={{ width: '150px' }}> {/* Fixed width */}
            <div className="relative w-8 h-64 bg-gray-700 rounded-full overflow-visible mr-4">
                <div
                    className="absolute bottom-0 left-0 right-0 bg-green-500 transition-all duration-75 ease-in-out rounded-b-full"
                    style={{ height: `${volumePercentage}%`, maxHeight: '100%' }}
                />
                {maxVolumePercentage > 0 ? <div
                    className="absolute left-0 right-0 h-0.5 bg-red-500"
                    style={{ bottom: `${maxVolumePercentage}%` }}
                />: null}
            </div>
            <div className="text-white text-sm flex flex-col justify-between h-64">
                <div>
                    Max: {Math.round(maxVolume)}
                </div>
                <div>
                    Current: {Math.round(volume)}
                </div>
            </div>
        </div>
    );
};