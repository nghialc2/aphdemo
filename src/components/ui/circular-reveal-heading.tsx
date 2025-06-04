"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"
import { 
    MorphingPopover,
    MorphingPopoverContent,
    MorphingPopoverTrigger 
} from '@/components/ui/morphing-popover'

interface TextItem {
    text: string;
    description: string;
    color?: string;
    image?: string;
}

interface CircularRevealHeadingProps {
    items: TextItem[];
    centerText: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
    sm: {
        container: 'h-[300px] w-[300px]',
        fontSize: 'text-sm',
        tracking: 'tracking-[0.15em]',
        radius: 120,
        gap: 60,
        imageSize: 'w-[75%] h-[75%]',
        textStyle: 'font-medium'
    },
    md: {
        container: 'h-[400px] w-[400px]',
        fontSize: 'text-base',
        tracking: 'tracking-[0.15em]',
        radius: 140,
        gap: 50,
        imageSize: 'w-[75%] h-[75%]',
        textStyle: 'font-medium',
    },
    lg: {
        container: 'h-[450px] w-[450px]',
        fontSize: 'text-base',
        tracking: 'tracking-[0.1em]',
        radius: 180,
        gap: 40,
        imageSize: 'w-[75%] h-[75%]',
        textStyle: 'font-bold'
    }
};

export const CircularRevealHeading = ({
    items,
    centerText,
    className,
    size = 'md'
}: CircularRevealHeadingProps) => {
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
    const config = sizeConfig[size];
    
    const createTextSegments = () => {
        const totalItems = items.length;
        const totalGapDegrees = config.gap * totalItems;
        const availableDegrees = 360 - totalGapDegrees;
        const segmentDegrees = availableDegrees / totalItems;
        
        return items.map((item, index) => {
            const startPosition = index * (segmentDegrees + config.gap);
            const startOffset = `${(startPosition / 360) * 100}%`;
            
            const textLength = totalItems === 3 ? `${segmentDegrees * 2.7}` : `${segmentDegrees * 1.8}`;
            
            return (
                <g key={index}>
                    <text
                        className={cn(
                            config.fontSize,
                            config.tracking,
                            config.textStyle,
                            "uppercase cursor-pointer transition-all duration-300"
                        )}
                        onClick={() => {
                            setActiveItemIndex(index);
                            setIsPopoverOpen(true);
                        }}
                        style={{
                            filter: 'url(#textShadow)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <textPath
                            href="#curve"
                            className={item.color ? "" : "fill-[url(#textGradient)] hover:fill-[#2d3436]"}
                            style={item.color ? { fill: item.color } : {}}
                            startOffset={startOffset}
                            textLength={textLength}
                            lengthAdjust="spacingAndGlyphs"
                        >
                            {item.text}
                        </textPath>
                    </text>
                </g>
            );
        });
    };

    return (
        <>
            <motion.div
                whileHover={{
                    boxShadow: "20px 20px 40px #bebebe, -20px -20px 40px #ffffff"
                }}
                whileTap={{ scale: 0.98 }}
                animate={{ y: [0, -8, 0] }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className={cn(
                    "relative overflow-hidden",
                    config.container,
                    "rounded-full bg-[#e6e6e6]",
                    "shadow-[16px_16px_32px_#bebebe,-16px_-16px_32px_#ffffff]",
                    "transition-all duration-500 ease-out",
                    className
                )}
            >
                <motion.div
                    className="absolute inset-[2px] rounded-full bg-[#e6e6e6]"
                    style={{
                        boxShadow: "inset 6px 6px 12px #d1d1d1, inset -6px -6px 12px #ffffff"
                    }}
                />

                <motion.div
                    className="absolute inset-[12px] rounded-full bg-[#e6e6e6]"
                    style={{
                        boxShadow: "inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff"
                    }}
                />

                <motion.div className="absolute inset-0 flex items-center justify-center">
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="relative z-10 p-6 rounded-3xl bg-[#e6e6e6]"
                            whileHover={{
                                boxShadow: "inset 3px 3px 6px #d1d1d1, inset -3px -3px 6px #ffffff"
                            }}
                        >
                            {centerText}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                <motion.div
                    className="absolute inset-0"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <svg viewBox="0 0 400 400" className="w-full h-full">
                        <defs>
                            <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#666666" />
                                <stop offset="100%" stopColor="#444444" />
                            </linearGradient>
                            <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="0" stdDeviation="1" floodOpacity="0.3" />
                            </filter>
                        </defs>
                        <path
                            id="curve"
                            fill="none"
                            d={`M 200,200 m -${config.radius},0 a ${config.radius},${config.radius} 0 1,1 ${config.radius * 2},0 a ${config.radius},${config.radius} 0 1,1 -${config.radius * 2},0`}
                        />
                        {createTextSegments()}
                    </svg>
                </motion.div>
            </motion.div>
            
            {/* Popover that appears when text is clicked */}
            <MorphingPopover 
                open={isPopoverOpen && activeItemIndex !== null} 
                onOpenChange={setIsPopoverOpen}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
                <MorphingPopoverContent className='w-[600px] max-w-[90vw] p-5 shadow-xl'>
                    {activeItemIndex !== null && items[activeItemIndex] && (
                        <div className='flex flex-col'>
                            {/* Header with title */}
                            <div className='mb-4'>
                                <motion.h4
                                    layout='position'
                                    className='text-2xl font-semibold border-b pb-2'
                                >
                                    {items[activeItemIndex].text}
                                </motion.h4>
                            </div>

                            {/* Large image at the top */}
                            <div className='w-full overflow-hidden rounded-lg mb-4'>
                                <img 
                                    src={items[activeItemIndex].image}
                                    alt={items[activeItemIndex].text}
                                    className='w-full h-[300px] object-cover'
                                />
                            </div>

                            {/* Description below the image */}
                            <div className='flex flex-col'>
                                <p className='text-base whitespace-pre-wrap leading-relaxed'>
                                    {items[activeItemIndex].description}
                                </p>
                            </div>
                        </div>
                    )}
                </MorphingPopoverContent>
            </MorphingPopover>
        </>
    );
}; 