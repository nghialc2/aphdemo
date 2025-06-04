import { CircularRevealHeading } from "@/components/ui/circular-reveal-heading";

// Note: ***When you hover on text it takes some time to load image***
const items = [
    {
        text: "CTO TRACK",
        description: "Chief Technology Officer track focused on technical leadership skills, AI implementation strategies, and future technology trends. Learn to guide organizations through digital transformation and innovation.",
        image: "https://i.ibb.co/yFkzB7f/ai-neon.jpg"
    },
    {
        text: "CEO TRACK",
        description: "Chief Executive Officer track designed to develop leadership capabilities, strategic vision, and AI-driven decision making skills for business leaders.",
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
    },
    {
        text: "CIO TRACK",
        description: "Chief Information Officer track focused on data governance, IT infrastructure optimization, and implementing AI solutions across the organization.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
    }
];

export function MediumCircularRevealHeadingDemo() {
    return (
        <div className="p-16 min-h-screen flex items-center justify-center">
            <CircularRevealHeading
                items={items}
                centerText={
                    <div className="text-xl font-bold text-[#444444]">
                        LEADERSHIP
                    </div>
                }
                size="md"
            />
        </div>
    );
}

export function LargeCircularRevealHeadingDemo() {
    return (
        <div className="p-16 min-h-screen flex items-center justify-center">
            <CircularRevealHeading
                items={items}
                centerText={
                    <div className="text-2xl font-bold text-[#444444]">
                        LEADERSHIP
                    </div>
                }
                size="lg"
            />
        </div>
    );
}

export function SmallCircularRevealHeadingDemo() {
    return (
        <div className="p-16 min-h-screen flex items-center justify-center">
            <CircularRevealHeading
                items={items}
                centerText={
                    <div className="text-sm font-bold text-[#444444]">
                        LEADERSHIP
                    </div>
                }
                size="sm"
            />
        </div>
    );
} 