import React from 'react';

export const AuroraBackground: React.FC = () => {
    return (
        <div className="aurora-container">
            <div className="static-background"></div>
            <svg className="waves" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="gradient1" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#00ff00" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#00ff00" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="gradient2" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#00ffff" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="gradient3" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#ff00ff" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#ff00ff" stopOpacity="0" />
                    </linearGradient>
                </defs>

                <path className="area area1" d="" fill="url(#gradient1)" />
                <path className="area area2" d="" fill="url(#gradient2)" />
                <path className="area area3" d="" fill="url(#gradient3)" />
            </svg>

            <style jsx>{`
                .aurora-container {
                    position: fixed;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    overflow: hidden;
                    z-index: -1;
                }

                .static-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(to bottom, #1c2331, #2c3e50, #34495e);
                    z-index: 1;
                }

                .waves {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 2;
                }

                .area {
                    animation: moveArea 20s infinite alternate ease-in-out;
                    mix-blend-mode: screen;
                }

                .area1 { animation-name: moveArea1; }
                .area2 { animation-name: moveArea2; }
                .area3 { animation-name: moveArea3; }

                @keyframes moveArea1 {
                    0% {
                        d: path("M-200,1000 Q50,700 300,550 T800,1000 V1000 H-200");
                    }
                    50% {
                        d: path("M-200,1000 Q50,600 300,500 T800,1000 V1000 H-200");
                    }
                    100% {
                        d: path("M-200,1000 Q50,650 300,450 T800,1000 V1000 H-200");
                    }
                }

                @keyframes moveArea2 {
                    0% {
                        d: path("M0,1000 Q216,550 433,650 T866,400 T1300,1000 V1000 H0");
                    }
                    50% {
                        d: path("M0,1000 Q216,600 433,500 T866,350 T1300,1000 V1000 H0");
                    }
                    100% {
                        d: path("M0,1000 Q216,500 433,600 T866,250 T1300,1000 V1000 H0");
                    }
                }

                @keyframes moveArea3 {
                    0% {
                        d: path("M200,1000 Q375,700 550,600 T850,500 T1150,300 T1450,1000 V1000 H200");
                    }
                    50% {
                        d: path("M200,1000 Q375,650 550,550 T850,450 T1150,250 T1450,1000 V1000 H200");
                    }
                    100% {
                        d: path("M200,1000 Q375,600 550,500 T850,400 T1150,350 T1450,1000 V1000 H200");
                    }
                }
            `}</style>
        </div>
    );
};