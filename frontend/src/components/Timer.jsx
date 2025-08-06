// Timer.jsx
import { useEffect, useState } from "react";

export default function Timer({ testTime, totalTime, onTimeUp }) {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!testTime || !totalTime) return;

        const endTime = new Date(new Date(testTime).getTime() + totalTime * 60000);

        const interval = setInterval(() => {
            const now = new Date();
            const diff = endTime - now;

            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft("Time's up!");
                if (onTimeUp) onTimeUp();
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                setTimeLeft(
                    `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`
                );
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [testTime, totalTime, onTimeUp]);

    return (
        <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold">{timeLeft || "--:--"}</span>
        </div>
    );
}